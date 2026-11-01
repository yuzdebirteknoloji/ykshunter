# APK'ya gömülecek içerik

Supabase'den aldığın dışa aktarımı bu klasöre koy:

- **Tek JSON dosyası** (önerilen): `content.json`
- **ya da CSV'ler:** `subjects.csv`, `topics.csv`, `question_sets.csv`, `image_games.csv`

APK derlenirken (GitHub Actions) `npm run content:prepare -- mobile/content-source` çalışır:
içerik okunur, Cloudinary görselleri indirilip APK'nın içine gömülür.
