# Nova

Nova is a Solana trading terminal. The app is a Next.js frontend for live token discovery, charts, wallet management, and trade actions (quick buy and sell, snipers, holdings, and trackers). Real-time market and account data arrives over WebSockets; REST covers auth, settings, and historical data.

## Stack

- **Next.js 15** (App Router) and **React 19**, TypeScript
- **Tailwind CSS** and Radix UI
- **Zustand** for client state, **TanStack Query** for server state
- **Solana wallet adapter** (Phantom) for login and signing
- **TradingView** charting library (`public/static/charting_library`)
- **Sentry** for error reporting
- **Axios** with a session interceptor (`src/libraries/axios.ts`)

Production builds use `output: "standalone"`.

## Routes

Authenticated routes live under `src/app/(main)`. Middleware (`src/middleware.ts`) sends users without a `_nova_session` cookie to `/login`. A logged-in session on `/login` is sent home. Users flagged with the `isNew` cookie stay on `/login` until onboarding finishes.

| Path | What it is |
| --- | --- |
| `/` | Cosmo — live columns for newly created, about to graduate, and graduated tokens |
| `/trending` | Trending tokens, with time and DEX filters stored in cookies |
| `/token/[mint]` | Token page: chart, buy/sell, trades, holders, top traders, dev tokens, position |
| `/wallet-tracker` | Tracked wallets and their activity |
| `/twitter-monitor` | Twitter account monitor |
| `/holdings` | Tokens held by the selected wallet |
| `/wallets` | Wallet manager |
| `/points` | Points |
| `/referral` | Referral tracker |
| `/settings` | Trade presets (quick buy, quick sell, buy/sell sniper) and page customization |
| `/verify-2fa` | Two-factor authentication |
| `/login` | Phantom (and Telegram) sign-in |

The header also links Cosmo, Trending, Wallet Tracker, Twitter Monitor, Holdings, and Points. A footer dock opens sniper, wallet tracker, Twitter monitor, alerts, and PnL tracker panels.

## How the app is wired

**Auth.** Login requests a nonce, the wallet signs it, and the backend returns a session. The client stores that session in the `_nova_session` cookie. Axios sends it as `X-Nova-Session`. A `401` or `"Invalid session"` clears cookies and storage and redirects to `/login`.

**Region.** The `_api_region` cookie (`US`, `EU`, or `ASIA`) picks the REST and WebSocket host when `NEXT_PUBLIC_NODE_ENV` is `production`. Other environments use `NEXT_PUBLIC_REST_MAIN_URL` and `NEXT_PUBLIC_WS_MAIN_URL`. See `src/utils/getBaseURLBasedOnRegion.ts` and `src/utils/getWSBaseURLBasedOnRegion.ts`.

**Realtime.** `AllWSProvider` (`src/providers/AllWSProvider.tsx`) wraps the main layout and opens sockets for the main feed (SOL price, holdings, alerts, and related channels), notification/tracker events, and the Twitter monitor. Messages land in Zustand stores that the pages read.

**Token page.** `src/app/(main)/token/[mint-address]` renders the chart (`TVChartContainer`) and trade tables. Candle and trade history come from the REST chart endpoints; live updates come from the sockets above.

**State.** Feature stores sit under `src/stores` (token, holdings, footer, settings, wallets). Shared UI primitives are in `src/components/ui`. Product UI is in `src/components/customs`. REST clients are in `src/apis/rest`.

## Project layout

```
src/
  app/            App Router pages, root layout, fonts
  apis/rest/      REST clients (auth, tokens, trades, wallets, settings, …)
  apis/ws/        TradingView WebSocket helpers
  components/     layouts, product UI, TradingView container, shadcn/ui
  stores/         Zustand stores
  providers/      React Query, Solana wallet, WebSocket provider
  hooks/          shared hooks
  types/          shared types
  utils/          formatters, region URLs, Phantom helpers, chart helpers
  constants/      shared constants
  libraries/      Axios instance and class-name helper
  middleware.ts   session gate
public/
  static/charting_library/   TradingView charting library
  static/datafeeds/          UDF datafeed used by the chart
```

Path aliases: `@/*` → `src/*`, `#/*` → `public/*`.

## Getting started

Node 20 is a safe match for Next.js 15. Install dependencies, then start the dev server (Turbopack, bound to `0.0.0.0`):

```bash
npm install
npm run dev
```

The app expects the env vars below. Copy them into `.env.local` (or `.env`). Do not commit secrets such as `SENTRY_AUTH_TOKEN`.

### Environment variables

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_WEB_URL` | Canonical site URL and metadata |
| `NEXT_PUBLIC_APP_URL` | Mobile wallet redirect origin |
| `NEXT_PUBLIC_NODE_ENV` | `production` switches REST/WS to the region map |
| `NEXT_PUBLIC_REST_MAIN_URL` | Main REST API outside production |
| `NEXT_PUBLIC_REST_MAIN_URL_US_SERVER` | US REST host |
| `NEXT_PUBLIC_REST_MAIN_URL_EU_SERVER` | EU REST host |
| `NEXT_PUBLIC_REST_MAIN_URL_ASIA_SERVER` | Asia REST host |
| `NEXT_PUBLIC_WS_MAIN_URL` | Main WebSocket outside production |
| `NEXT_PUBLIC_WS_MAIN_URL_US_SERVER` | US WebSocket host |
| `NEXT_PUBLIC_WS_MAIN_URL_EU_SERVER` | EU WebSocket host |
| `NEXT_PUBLIC_WS_MAIN_URL_ASIA_SERVER` | Asia WebSocket host |
| `NEXT_PUBLIC_WS_TWITTER_MONITOR_URL` | Twitter monitor WebSocket |
| `NEXT_PUBLIC_REST_TWITTER_MONITOR_URL` | Twitter monitor REST search |
| `NEXT_PUBLIC_REST_ONCHAIN_URL` | On-chain REST (tokens, trades) |
| `NEXT_PUBLIC_TWITTER_FETCHER_URL` | Social/media fetcher (defaults to `https://media.nova.trade/api`) |
| `NEXT_PUBLIC_IMAGE_PROXY_URL` | Image proxy for token and PnL images |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry client DSN |
| `SENTRY_AUTH_TOKEN` | Sentry source-map upload at build time |
| `ANALYZE` | Set to `true` to open the bundle analyzer during `next build` |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`next lint`) |
| `npm run tsc` | Typecheck without emitting |
| `npm run format` | Prettier write |

`postinstall` runs `patch-package`.

## Charts

The TradingView charting library and UDF datafeed ship under `public/static`. Those files are third-party and cached separately in `vercel.json`. Chart defaults live in `src/constants/trading-view.constant.ts`. Candle requests go to `{REST}/charts/candles` and trades to `{REST}/charts/trades`.
