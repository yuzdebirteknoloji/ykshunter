-- ============================================
-- BASIT KULLANICI VE OYUN İSTATİSTİK SİSTEMİ
-- ============================================

-- Kullanıcılar Tablosu (Basit Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hash
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  
  -- İstatistikler
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Oyun Sonuçları
CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Oyun Bilgisi
  topic_id TEXT NOT NULL, -- 'noron-yapisi'
  mode TEXT NOT NULL, -- 'matching', 'sequence', 'grouping'
  
  -- Sonuç
  is_correct BOOLEAN NOT NULL,
  mistakes INTEGER DEFAULT 0,
  time_spent INTEGER NOT NULL, -- milliseconds
  score INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  
  -- Metadata
  played_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_mode CHECK (mode IN ('matching', 'sequence', 'grouping'))
);

-- Kullanıcı İstatistikleri (Konu Bazlı)
CREATE TABLE IF NOT EXISTS user_topic_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  
  -- Mod Bazlı Tamamlanma
  matching_completed BOOLEAN DEFAULT FALSE,
  sequence_completed BOOLEAN DEFAULT FALSE,
  grouping_completed BOOLEAN DEFAULT FALSE,
  
  -- İstatistikler
  total_plays INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  
  last_played_at TIMESTAMPTZ,
  
  UNIQUE(user_id, topic_id)
);

-- Günlük Aktivite (Streak Hesaplama)
CREATE TABLE IF NOT EXISTS daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  games_played INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  
  UNIQUE(user_id, activity_date)
);

-- ============================================
-- İNDEXLER (Performans)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_game_results_user ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_topic ON game_results(topic_id);
CREATE INDEX IF NOT EXISTS idx_game_results_played_at ON game_results(played_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_topic_stats_user ON user_topic_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_stats_topic ON user_topic_stats(topic_id);

CREATE INDEX IF NOT EXISTS idx_daily_activity_user ON daily_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_date ON daily_activity(activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- FUNCTIONS (Otomatik İşlemler)
-- ============================================

-- Oyun sonucu kaydedildiğinde XP ve istatistikleri güncelle
CREATE OR REPLACE FUNCTION update_user_stats_on_game_result()
RETURNS TRIGGER AS $$
BEGIN
  -- Kullanıcı XP'sini güncelle
  UPDATE users 
  SET 
    total_xp = total_xp + NEW.xp_earned,
    level = FLOOR((total_xp + NEW.xp_earned) / 100) + 1,
    last_activity_date = CURRENT_DATE
  WHERE id = NEW.user_id;
  
  -- Konu istatistiklerini güncelle
  INSERT INTO user_topic_stats (user_id, topic_id, total_plays, best_score, total_xp, last_played_at)
  VALUES (NEW.user_id, NEW.topic_id, 1, NEW.score, NEW.xp_earned, NOW())
  ON CONFLICT (user_id, topic_id) 
  DO UPDATE SET
    total_plays = user_topic_stats.total_plays + 1,
    best_score = GREATEST(user_topic_stats.best_score, NEW.score),
    total_xp = user_topic_stats.total_xp + NEW.xp_earned,
    last_played_at = NOW();
  
  -- Mod tamamlanma durumunu güncelle
  IF NEW.is_correct THEN
    UPDATE user_topic_stats
    SET 
      matching_completed = CASE WHEN NEW.mode = 'matching' THEN TRUE ELSE matching_completed END,
      sequence_completed = CASE WHEN NEW.mode = 'sequence' THEN TRUE ELSE sequence_completed END,
      grouping_completed = CASE WHEN NEW.mode = 'grouping' THEN TRUE ELSE grouping_completed END
    WHERE user_id = NEW.user_id AND topic_id = NEW.topic_id;
  END IF;
  
  -- Günlük aktiviteyi güncelle
  INSERT INTO daily_activity (user_id, activity_date, games_played, xp_earned)
  VALUES (NEW.user_id, CURRENT_DATE, 1, NEW.xp_earned)
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    games_played = daily_activity.games_played + 1,
    xp_earned = daily_activity.xp_earned + NEW.xp_earned;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Oyun sonucu kaydedildiğinde
CREATE TRIGGER on_game_result_insert
AFTER INSERT ON game_results
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_game_result();

-- Streak hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
BEGIN
  -- Bugünden geriye doğru kontrol et
  FOR v_check_date IN 
    SELECT activity_date 
    FROM daily_activity 
    WHERE user_id = p_user_id 
    ORDER BY activity_date DESC
  LOOP
    -- Eğer tarih beklenen tarihse streak devam ediyor
    IF v_check_date = v_current_date THEN
      v_streak := v_streak + 1;
      v_current_date := v_current_date - INTERVAL '1 day';
    ELSE
      -- Streak kırıldı
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS (Kolay Sorgular)
-- ============================================

-- Kullanıcı Leaderboard
CREATE VIEW leaderboard AS
SELECT 
  u.id,
  u.username,
  u.display_name,
  u.total_xp,
  u.level,
  u.streak_days,
  COUNT(DISTINCT gr.topic_id) as topics_completed,
  COUNT(gr.id) as total_games_played
FROM users u
LEFT JOIN game_results gr ON u.id = gr.user_id
GROUP BY u.id
ORDER BY u.total_xp DESC;

-- Kullanıcı Detaylı İstatistikler
CREATE VIEW user_detailed_stats AS
SELECT 
  u.id as user_id,
  u.username,
  u.total_xp,
  u.level,
  u.streak_days,
  COUNT(DISTINCT gr.topic_id) as unique_topics_played,
  COUNT(gr.id) as total_games,
  COUNT(CASE WHEN gr.is_correct THEN 1 END) as correct_games,
  ROUND(AVG(gr.score), 2) as avg_score,
  SUM(gr.xp_earned) as total_xp_earned,
  MAX(gr.played_at) as last_game_played
FROM users u
LEFT JOIN game_results gr ON u.id = gr.user_id
GROUP BY u.id;

-- ============================================
-- ÖRNEK VERİ (Test İçin)
-- ============================================

-- Test kullanıcıları
-- Şifre: test123 (bcrypt hash)
INSERT INTO users (username, password_hash, display_name, total_xp, level) VALUES
('ahmet', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ahmet Yılmaz', 250, 3),
('ayse', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ayşe Demir', 180, 2),
('mehmet', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mehmet Kaya', 420, 5);

-- ============================================
-- DUYURU SİSTEMİ
-- ============================================

-- Duyurular Tablosu
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'update'
  icon TEXT DEFAULT '📢',
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- Yüksek öncelik üstte gösterilir
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL ise süresiz
  
  CONSTRAINT valid_type CHECK (type IN ('info', 'success', 'warning', 'update'))
);

-- Kullanıcı Duyuru Görüntüleme
CREATE TABLE IF NOT EXISTS user_announcement_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, announcement_id)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_announcement_views_user ON user_announcement_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_announcement_views_announcement ON user_announcement_views(announcement_id);

-- Aktif duyuruları getir (kullanıcı görmemiş olanlar)
CREATE VIEW active_announcements AS
SELECT 
  a.*,
  COUNT(uav.id) as view_count
FROM announcements a
LEFT JOIN user_announcement_views uav ON a.id = uav.announcement_id
WHERE 
  a.is_active = TRUE 
  AND (a.expires_at IS NULL OR a.expires_at > NOW())
GROUP BY a.id
ORDER BY a.priority DESC, a.created_at DESC;

-- ============================================
-- NOTLAR
-- ============================================

/*
KULLANIM:

1. Kullanıcı Girişi:
   - Frontend'de username/password al
   - Backend API'de bcrypt ile hash'i kontrol et
   - Session/Cookie oluştur

2. Oyun Sonucu Kaydetme:
   INSERT INTO game_results (user_id, topic_id, mode, is_correct, mistakes, time_spent, score, xp_earned)
   VALUES (...);
   -- Trigger otomatik olarak tüm istatistikleri günceller

3. Kullanıcı İstatistikleri:
   SELECT * FROM user_detailed_stats WHERE user_id = '...';

4. Leaderboard:
   SELECT * FROM leaderboard LIMIT 10;

5. Konu İlerlemesi:
   SELECT * FROM user_topic_stats WHERE user_id = '...' AND topic_id = '...';

6. Streak Güncelleme (Günlük cron job):
   UPDATE users SET streak_days = calculate_user_streak(id);
*/
