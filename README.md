# Uşaqların Gündəlik Fəaliyyətləri - Veb Tətbiq

Uşaqların gündəlik tapşırıqlarının izlənilməsi, qiymətləndirilməsi və statistik hesabatlar üçün React + Supabase veb tətbiqi.

## Texnologiyalar

- **Frontend:** React.js (Create React App)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Oflayn:** IndexedDB + avtomatik sinxronizasiya
- **Excel:** xlsx kitabxanası (ixrac/import)

## Quraşdırma

```bash
npm install
cp .env.example .env
# .env faylında Supabase məlumatlarını doldurun
npm start
```

## Supabase konfiqurasiyası

1. [Supabase](https://supabase.com) layihəsi yaradın
2. SQL Editor-də `supabase/migrations/001_initial_schema.sql` faylını icra edin
3. Authentication → Users bölməsində admin istifadəçi yaradın
4. `.env` faylına URL və anon key əlavə edin:

```
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Demo rejim

Supabase konfiqurasiya olunmayıbsa, tətbiq lokal demo rejimində işləyir (IndexedDB). PIN kod ilə giriş: **1234**

## Seçilmiş texniki qərarlar

| Sual | Qərar |
|------|-------|
| Oflayn saxlama | IndexedDB |
| Excel | İxrac/Import (əsas DB: Supabase) |
| Qiymətləndirmə | Bal + Ulduz |
| Silinən uşaqlar | Arxivə köçürülür |
| Audit jurnalı | Bəli |
| Şəkillər | Supabase Storage |
| Sinxronizasiya | Avtomatik + əl ilə |
| Qrafiklər | Bəli (Recharts) |

## Struktur

```
src/
├── components/     # UI komponentləri
├── contexts/       # Auth və Data context
├── lib/            # API, IndexedDB, Excel, utils
└── App.js          # Əsas tətbiq
```

## Menyu

1. **Əsas panel** — Uşaqlar sütunlar şəklində, tapşırıq icrası
2. **Uşaq əlavə et** — Yeni uşaq forması
3. **Tapşırıqlar** — Tapşırıq idarəetməsi
4. **Nəticələr** — Bal düzəlişləri, dövr üzrə nəticələr
5. **Hesabatlar** — Statistika və qrafiklər
6. **Sinxronizasiya** — Supabase sync, Excel ixrac/import
7. **Parametrlər** — PIN kod, audit jurnalı
