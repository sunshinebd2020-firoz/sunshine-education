# Sunshine Education

## Setup

```bash
npm install
npm run dev
```

Configure the PHP API URL in `.env` using `.env.example` as a template:

```env
VITE_API_BASE_URL=https://example.com/sunshine-api/api
```

The value must include the `/api` path. Run the production checks with:

```bash
npm run lint
npm run build
```

The PHP API is not included in this repository. Admin authentication and
permissions must be enforced by that backend; browser-side checks only
control navigation and user experience.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Local domains

The local development profile uses XAMPP and these host names:

- Frontend: `http://sunshine.test`
- API and uploads: `http://api.sunshine.test`

Start the Vite server with `npm run dev`; Apache proxies `sunshine.test` to Vite on port 5173. The API is served directly by Apache from `C:/xampp/htdocs/sunshine-api`, including `/uploads`.

The Apache configuration is in `local/apache/sunshine-vhosts.conf`. It enables CORS only for `http://sunshine.test`, keeps session cookies on `api.sunshine.test`, and passes the local MySQL defaults as environment variables. Change those `DB_*` values if your MySQL credentials differ.