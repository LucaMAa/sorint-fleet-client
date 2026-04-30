# Sorint Fleet — Frontend

React 19 + TypeScript + Vite. Dark theme, sidebar layout, full CRUD veicoli, gestione utenti (admin), profilo.

## Setup

```bash
npm install
cp .env.example .env          # configura VITE_API_URL
npm run dev
```

## Build

```bash
npm run build
```

## Deploy gratuito su Vercel

1. Push su GitHub
2. Vai su [vercel.com](https://vercel.com) → Import project
3. Framework: **Vite**
4. Aggiungi env var: `VITE_API_URL=https://tua-api.com/api/v1`
5. Deploy ✓

## Struttura

```
src/
  api/client.ts          — fetch wrapper con auth header
  contexts/AuthContext   — token + user in localStorage
  hooks/useApi           — data fetching generico
  components/
    ui/                  — Button, Input, Modal, Toast, Badge...
    layout/Layout        — Sidebar + topbar responsive
    ProtectedRoute       — redirect se non auth / non admin
  pages/
    Login/               — login + register in una pagina
    Dashboard/           — stats + tabella veicoli recenti
    Vehicles/            — lista, form, assegna, rimuovi, elimina
    Users/               — lista utenti + modifica ruolo (admin)
    Profile/             — form profilo + cambio password
```

## Rotte API usate

| Metodo | Path | Chi |
|--------|------|-----|
| POST | /auth/login | tutti |
| POST | /auth/register | tutti |
| GET | /vehicles | auth |
| POST | /vehicles | admin |
| PATCH | /vehicles/:id/assign | admin |
| PATCH | /vehicles/:id/unassign | admin |
| DELETE | /vehicles/:id | admin |
| GET | /users | admin |
| PATCH | /users/:id/role | admin |
