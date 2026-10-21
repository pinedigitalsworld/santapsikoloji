# Santa Psikoloji

Next.js 16 (App Router, Tailwind v4), tamamen statik üretim. Node 22 gerekir.

    export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
    npm run dev      # geliştirme
    npm run build && npm start

İçerik: `src/data/content.json` (santapsikoloji.com'dan alınan metinler), görseller: `public/images`.
İletişim bilgileri ve menü: `src/lib/site.ts`.
