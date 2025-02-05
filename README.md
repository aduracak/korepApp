# KorepApp

KorepApp je moderna web aplikacija za upravljanje instrukcijama i praćenje napretka učenika.

## Tehnologije

- React + TypeScript
- Vite
- TanStack Query
- TanStack Router
- Tailwind CSS
- Framer Motion
- Supabase

## Razvoj

### Preduslovi

- Node.js 18+
- npm ili yarn
- Supabase račun

### Instalacija

1. Klonirajte repozitorij:
```bash
git clone https://github.com/aduracak/korepapp.git
cd korepapp
```

2. Instalirajte dependencies:
```bash
npm install
```

3. Kopirajte .env.example u .env i podesite varijable:
```bash
cp .env.example .env
```

4. Pokrenite development server:
```bash
npm run dev
```

### Struktura projekta

```
src/
  ├── components/     # React komponente
  ├── contexts/       # React konteksti
  ├── hooks/         # Custom React hooks
  ├── layouts/       # Layout komponente
  ├── lib/           # Utility funkcije i konfiguracija
  ├── pages/         # Page komponente
  ├── styles/        # CSS/Tailwind stilovi
  └── types/         # TypeScript tipovi
```

## Licenca

MIT 