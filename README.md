# 🌿 PrakritiConnect

**PrakritiConnect** ("prakriti" — nature) is a green event-management platform that
connects **volunteers**, **organizers**, and **admins** around real environmental
action: tree plantations, beach & river cleanups, waste-segregation drives, wildlife
awareness rallies, water conservation camps, and more.

- **Volunteers** discover nearby drives, register, collect points, and download a
  QR-coded entry pass.
- **Organizers** publish events, track sign-ups, check participants in, and export
  attendance as CSV.
- **Admins** review and approve new events before they go live, and can block
  abusive accounts.

## Tech stack

- **Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT auth
- **Frontend:** React 19 (Vite), React Router, Axios, Tailwind CSS
- **Tickets:** QR codes + branded PDF passes (html2canvas + jsPDF)
- **No Socket.IO, no file-upload storage** — kept intentionally simple so both
  halves deploy cleanly as serverless functions / static sites on **Vercel**.

## Monorepo structure

```
backend/   Express API — routes, controllers, MongoDB models
  api/     Vercel serverless entry point (wraps the Express app)
  src/     App code; src/server.js is the local-dev entry point
frontend/  Vite + React app (Tailwind), pages, components, hooks
```

## Getting started locally

**Prerequisites:** Node.js 18+, a MongoDB connection (local or Atlas).

```bash
git clone <your-repo-url>
cd PrakritiConnect

# Backend
cd backend
cp .env.example .env   # then fill in MONGO_URI / JWT_SECRET if needed
npm install
npm run dev             # http://localhost:5050

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev              # http://localhost:5173
```

Vite proxies `/api` requests to `http://localhost:5050` in dev, so the two apps
talk to each other with no extra config.

### Seed demo data (optional)

```bash
cd backend
npm run seed
```

Demo accounts (password for all: `password`):

| Role       | Email                    |
|------------|--------------------------|
| Volunteer  | volunteer@example.com    |
| Organizer  | organizer@example.com    |
| Admin      | admin@example.com        |

## Deploying to Vercel

The project deploys as **two small Vercel projects** — one for the API, one for
the static frontend. Both are configured and ready to go.

### 1. Deploy the backend (`backend/`)

1. Push this repo to GitHub, then in Vercel choose **New Project** → import the
   repo → set **Root Directory** to `backend`.
2. Vercel will detect `api/index.js` as a Node.js serverless function
   automatically; `vercel.json` routes every request through it so the Express
   app's own routing (`/api/...`) still works.
3. Add environment variables in the Vercel project settings:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random string
   - `JWT_EXPIRES_IN` — e.g. `7d`
   - `CLIENT_URL` — your frontend's deployed URL (for CORS), e.g.
     `https://prakriticonnect.vercel.app`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` — optional,
     only needed if you want registration confirmation emails
4. Deploy. Note the resulting URL, e.g. `https://prakriticonnect-api.vercel.app`.

### 2. Deploy the frontend (`frontend/`)

1. New Project in Vercel → same repo → **Root Directory** set to `frontend`.
   Vercel auto-detects the Vite build (`npm run build`, output `dist/`).
2. Add one environment variable:
   - `VITE_API_URL` — the backend URL from step 1, e.g.
     `https://prakriticonnect-api.vercel.app`
3. Deploy.

That's it — no Socket.IO, no persistent server, no file-storage bucket to set
up. Event posters are added as an image URL rather than an upload, which is
what keeps this deployable on Vercel's serverless model without extra
infrastructure.

## Notable design decisions

- **Poster images are URLs, not uploads.** Serverless functions don't have
  persistent disk, so organizers paste a link to a hosted image instead of
  uploading a file.
- **CSV export is generated in memory** (not written to a temp file) for the
  same reason.
- **No real-time layer.** The original project used Socket.IO for a live
  announcement banner; it's been removed so the API can run as a stateless
  serverless function.

## License

MIT
