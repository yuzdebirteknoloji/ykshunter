-- =====================================================================
-- YKS Hunter v2 — Supabase Auth + RLS + roller + liderlik tablosu
-- Supabase Dashboard > SQL Editor'da TEK SEFERDE çalıştırın.
-- Tekrar çalıştırılması güvenlidir (idempotent).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) PROFILLER (auth.users ile 1-1)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_.]{3,24}$'),
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin kontrolü (RLS politikalarında kullanılır)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- Yeni kullanıcı kaydolunca profil oluştur. İLK kaydolan kişi admin olur.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, role)
  VALUES (
    NEW.id,
    lower(COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username'),
    CASE WHEN EXISTS (SELECT 1 FROM public.profiles) THEN 'user' ELSE 'admin' END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2) KULLANICIYA BAĞLI TABLOLARI eski public.users yerine profiles'a bağla
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  topic_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  mistakes INTEGER DEFAULT 0,
  time_spent INTEGER NOT NULL,
  score INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.user_topic_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  topic_id TEXT NOT NULL,
  matching_completed BOOLEAN DEFAULT FALSE,
  sequence_completed BOOLEAN DEFAULT FALSE,
  grouping_completed BOOLEAN DEFAULT FALSE,
  total_plays INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  UNIQUE (user_id, topic_id)
);
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  activity_date DATE NOT NULL,
  games_played INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  UNIQUE (user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_game_results_user_played ON public.game_results(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON public.daily_activity(user_id, activity_date DESC);

-- Görsel oyun sonuçları da kaydedilebilsin
ALTER TABLE public.game_results DROP CONSTRAINT IF EXISTS valid_mode;
ALTER TABLE public.game_results
  ADD CONSTRAINT valid_mode CHECK (mode IN ('matching', 'sequence', 'grouping', 'image'));

-- user_id kolonlarındaki eski FK'leri (public.users) kaldır, profiles'a bağla.
-- NOT VALID: eski kullanıcıya ait satırlar claim_legacy_data() ile taşınana kadar kalabilir.
DO $$
DECLARE
  t TEXT;
  c RECORD;
BEGIN
  FOREACH t IN ARRAY ARRAY['game_results', 'user_topic_stats', 'daily_activity',
                           'trial_analyses', 'mindmap_analyses', 'user_announcement_views']
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;

    FOR c IN
      SELECT con.conname
      FROM pg_constraint con
      JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
      WHERE con.conrelid = ('public.' || t)::regclass
        AND con.contype = 'f'
        AND att.attname = 'user_id'
    LOOP
      EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', t, c.conname);
    END LOOP;

    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE NOT VALID',
      t, t || '_user_id_profiles_fkey');
  END LOOP;
END $$;

-- Analiz tablolarında user_id varsayılan olarak giriş yapan kullanıcı olsun
DO $$
BEGIN
  IF to_regclass('public.trial_analyses') IS NOT NULL THEN
    ALTER TABLE public.trial_analyses ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;
  IF to_regclass('public.mindmap_analyses') IS NOT NULL THEN
    ALTER TABLE public.mindmap_analyses ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 3) OYUN SONUCU → XP, LEVEL, STREAK
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_user_stats_on_game_result()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Europe/Istanbul')::DATE;
BEGIN
  UPDATE public.profiles p
  SET
    total_xp = p.total_xp + NEW.xp_earned,
    level = FLOOR((p.total_xp + NEW.xp_earned) / 100) + 1,
    streak_days = CASE
      WHEN p.last_activity_date = v_today THEN GREATEST(p.streak_days, 1)
      WHEN p.last_activity_date = v_today - 1 THEN p.streak_days + 1
      ELSE 1
    END,
    last_activity_date = v_today
  WHERE p.id = NEW.user_id;

  INSERT INTO public.user_topic_stats (user_id, topic_id, total_plays, best_score, total_xp, last_played_at,
                                       matching_completed, sequence_completed, grouping_completed)
  VALUES (NEW.user_id, NEW.topic_id, 1, NEW.score, NEW.xp_earned, NOW(),
          NEW.is_correct AND NEW.mode = 'matching',
          NEW.is_correct AND NEW.mode = 'sequence',
          NEW.is_correct AND NEW.mode = 'grouping')
  ON CONFLICT (user_id, topic_id) DO UPDATE SET
    total_plays = user_topic_stats.total_plays + 1,
    best_score = GREATEST(user_topic_stats.best_score, NEW.score),
    total_xp = user_topic_stats.total_xp + NEW.xp_earned,
    last_played_at = NOW(),
    matching_completed = user_topic_stats.matching_completed OR EXCLUDED.matching_completed,
    sequence_completed = user_topic_stats.sequence_completed OR EXCLUDED.sequence_completed,
    grouping_completed = user_topic_stats.grouping_completed OR EXCLUDED.grouping_completed;

  INSERT INTO public.daily_activity (user_id, activity_date, games_played, xp_earned)
  VALUES (NEW.user_id, v_today, 1, NEW.xp_earned)
  ON CONFLICT (user_id, activity_date) DO UPDATE SET
    games_played = daily_activity.games_played + 1,
    xp_earned = daily_activity.xp_earned + NEW.xp_earned;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_game_result_insert ON public.game_results;
CREATE TRIGGER on_game_result_insert
AFTER INSERT ON public.game_results
FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_on_game_result();

-- ---------------------------------------------------------------------
-- 4) LİDERLİK TABLOSU (p_days = 0 → tüm zamanlar)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  user_id UUID, username TEXT, display_name TEXT, level INTEGER,
  total_xp INTEGER, period_xp BIGINT, streak_days INTEGER
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.username, p.display_name, p.level, p.total_xp,
         CASE WHEN p_days > 0 THEN COALESCE(SUM(d.xp_earned), 0) ELSE p.total_xp END AS period_xp,
         CASE WHEN p.last_activity_date >= (NOW() AT TIME ZONE 'Europe/Istanbul')::DATE - 1
              THEN p.streak_days ELSE 0 END
  FROM public.profiles p
  LEFT JOIN public.daily_activity d
    ON d.user_id = p.id
   AND p_days > 0
   AND d.activity_date > (NOW() AT TIME ZONE 'Europe/Istanbul')::DATE - p_days
  WHERE auth.uid() IS NOT NULL
  GROUP BY p.id
  ORDER BY period_xp DESC, p.total_xp DESC
  LIMIT 100;
$$;
REVOKE ALL ON FUNCTION public.get_leaderboard(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(INTEGER) TO authenticated;

-- ---------------------------------------------------------------------
-- 5) ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
-- Önce eski (çalışmayan) politikaları temizle
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'subjects', 'topics', 'question_sets', 'image_games', 'announcements',
                        'game_results', 'user_topic_stats', 'daily_activity', 'trial_analyses',
                        'mindmap_analyses', 'user_announcement_views', 'users')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Profiller: herkes (giriş yapmış) görebilir, sadece görünen adını değiştirebilir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY profiles_admin_all ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;

-- İçerik tabloları: giriş yapan herkes okur, sadece admin yazar
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['subjects', 'topics', 'question_sets', 'image_games', 'announcements']
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)', t || '_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t || '_admin_write', t);
  END LOOP;
END $$;

-- Kişisel tablolar: sadece sahibi
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['trial_analyses', 'mindmap_analyses', 'user_announcement_views']
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())', t || '_own', t);
  END LOOP;
END $$;

-- İstatistik tabloları: sahibi okur; yazma sadece sunucu (service role) ve trigger üzerinden
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['game_results', 'user_topic_stats', 'daily_activity']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (user_id = auth.uid())', t || '_read_own', t);
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM anon, authenticated', t);
  END LOOP;
END $$;

-- Eski şifre-hash'li kullanıcı tablosunu ve onu sızdıran view'ları kilitle
DROP VIEW IF EXISTS public.leaderboard;
DROP VIEW IF EXISTS public.user_detailed_stats;
DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON public.users FROM anon, authenticated;
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 6) ESKİ VERİYİ SAHİPLEN
-- Yeni sistemde kaydolduktan sonra (ilk kaydolan admin olur), SQL Editor'da değil
-- uygulamanın Ayarlar sayfasından "Eski verilerimi taşı" butonuyla çağrılır.
-- Eski tek-kullanıcılı sistemdeki tüm analizleri, oyun sonuçlarını ve XP'yi admin'e aktarır.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_legacy_data()
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_me UUID := auth.uid();
  v_trial INT := 0;
  v_mindmap INT := 0;
  v_games INT := 0;
  v_legacy_xp INT := 0;
  v_sql TEXT;
BEGIN
  IF v_me IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Sadece admin eski veriyi taşıyabilir';
  END IF;

  -- Eski sistemde fiilen kullanılan hesabın XP'si (analizi veya oyun sonucu olan)
  IF to_regclass('public.users') IS NOT NULL THEN
    v_sql := 'SELECT user_id FROM public.game_results';
    IF to_regclass('public.trial_analyses') IS NOT NULL THEN
      v_sql := v_sql || ' UNION SELECT user_id FROM public.trial_analyses';
    END IF;
    IF to_regclass('public.mindmap_analyses') IS NOT NULL THEN
      v_sql := v_sql || ' UNION SELECT user_id FROM public.mindmap_analyses';
    END IF;
    EXECUTE 'SELECT COALESCE(MAX(total_xp), 0) FROM public.users WHERE id IN (' || v_sql || ')'
      INTO v_legacy_xp;
  END IF;

  IF to_regclass('public.trial_analyses') IS NOT NULL THEN
    UPDATE public.trial_analyses SET user_id = v_me
    WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM public.profiles);
    GET DIAGNOSTICS v_trial = ROW_COUNT;
  END IF;

  IF to_regclass('public.mindmap_analyses') IS NOT NULL THEN
    UPDATE public.mindmap_analyses SET user_id = v_me
    WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM public.profiles);
    GET DIAGNOSTICS v_mindmap = ROW_COUNT;
  END IF;

  -- Eski oyun sonuçlarını sil (trigger'ı tekrar tetiklememek için taşımıyoruz), XP'yi direkt aktar
  DELETE FROM public.user_topic_stats WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM public.profiles);
  DELETE FROM public.daily_activity WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM public.profiles);
  DELETE FROM public.game_results WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM public.profiles);
  GET DIAGNOSTICS v_games = ROW_COUNT;

  UPDATE public.profiles
  SET total_xp = GREATEST(total_xp, v_legacy_xp),
      level = FLOOR(GREATEST(total_xp, v_legacy_xp) / 100) + 1
  WHERE id = v_me;

  RETURN json_build_object('trial_analyses', v_trial, 'mindmap_analyses', v_mindmap, 'old_game_results', v_games);
END;
$$;
REVOKE ALL ON FUNCTION public.claim_legacy_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_legacy_data() TO authenticated;

-- Fonksiyonların anon tarafından çağrılmasını engelle
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
