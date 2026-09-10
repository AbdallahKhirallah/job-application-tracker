# Deploying JAT

Target stack:

| Piece    | Host                                   | Cost |
|----------|----------------------------------------|------|
| Frontend | Vercel                                 | Free |
| Backend  | Railway (Web Service)                  | Hobby $5/mo |
| Database | Railway PostgreSQL                     | included in Hobby usage |
| Files    | DigitalOcean Spaces (unchanged)        | existing |
| Email    | SendGrid (unchanged)                   | Free |

Railway's Hobby plan keeps the backend running 24/7 (no cold starts), so the
in‑process 8 AM reminder cron works without any external scheduler.

---

## 1. Backend + Database — Railway

### Create the project
1. <https://railway.com> → **New Project** → **Deploy from GitHub repo** → pick the repo.
2. On the created service: **Settings → Source → Root Directory** = `server`.
   (Railway then reads `server/railway.json` for build/start/healthcheck.)

### Add PostgreSQL
3. In the project canvas: **Create → Database → PostgreSQL**.
4. Load the schema. Open the Postgres service → **Data** tab → **Query**, and paste
   the contents of `server/database/schema.sql`. (Or locally:
   `psql "<Postgres → Variables → DATABASE_PUBLIC_URL>" -f server/database/schema.sql`.)

### Environment variables (on the backend service → Variables)

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference — click "Add Reference") |
| `JWT_SECRET` | random 64‑char string — `openssl rand -hex 32` |
| `FRONTEND_URL` | `https://trackjat.me,https://www.trackjat.me` (add the Vercel URL too until the domain is live) |
| `CRON_SECRET` | any random string (only used if you add an external trigger later) |
| `SENDGRID_API_KEY` | from SendGrid |
| `SENDGRID_FROM_EMAIL` | your verified sender address |
| `DO_SPACES_KEY` | from DigitalOcean Spaces |
| `DO_SPACES_SECRET` | from DigitalOcean Spaces |
| `DO_SPACES_REGION` | e.g. `fra1` |
| `DO_SPACES_BUCKET` | your bucket name |

> `PORT` is injected by Railway automatically — do **not** set it. The server
> already reads `process.env.PORT`.

### Expose it
5. Backend service → **Settings → Networking → Generate Domain**.
   You get e.g. `https://jat-api-production.up.railway.app`.
6. Check `https://<that domain>/health` returns `{"status":"ok"}`.

### Reminder cron timezone
The daily job is scheduled for `0 8 * * *` in the container's timezone (UTC on
Railway) → 08:00 UTC. To pin it to your local time, set a `TZ` variable (e.g.
`TZ=Africa/Cairo`) on the backend service.

## 2. Frontend — Vercel

1. <https://vercel.com/new> → import the repo.
2. Framework preset **Vite**, root directory = repo root (build `npm run build`,
   output `dist` — auto‑detected).
3. Environment variable:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://<your-railway-domain>/api` |

4. Deploy. Open the app, register/login, confirm the network tab hits the Railway
   URL with no CORS errors.

## 3. Custom domain — trackjat.me

1. Vercel → project → **Settings → Domains** → add `trackjat.me` and `www.trackjat.me`.
2. At your DNS registrar, add the records Vercel shows (apex `A`/`ALIAS`, `www` `CNAME`).
3. Once the domain resolves, ensure `FRONTEND_URL` on Railway lists the final
   domain(s), then redeploy the backend service.

## 4. Verify end to end

- Register a new account, log in.
- Add an application, edit its status, delete it.
- Upload a PDF resume to a card, view it, remove it (checks Spaces creds).
- Optionally set an interview date 2 or 7 days out and hit
  `POST /api/cron/reminders` with header `x-cron-secret: <CRON_SECRET>` to confirm
  the reminder email sends.

## 5. Decommission DigitalOcean

Once everything above passes, destroy the DigitalOcean **Droplet**. Keep the
**Spaces bucket** — it still stores resumes.

---

## Local development is unchanged

`server/.env` still uses the discrete `DB_HOST` / `DB_PORT` / … vars. `DATABASE_URL`
is only read when it is set, so local setup is untouched.
