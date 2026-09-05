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

## License

MIT
