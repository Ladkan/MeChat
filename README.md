# MeChat 💬

Real-time chatovací aplikace vytvořená pomocí Reactu, Node.js, Socket.io, Better-Auth a Drizzle ORM. Uživatelé se mohou registrovat, připojovat do chatovacích místností a okamžitě si vyměňovat zprávy — vše je ukládáno do lokální SQLite databáze.

---

## Tech Stack

| Vrstva      | Technologie                      |
| ----------- | -------------------------------- |
| Frontend    | React 19 + Vite + TypeScript     |
| Routing     | React Router v7 (framework mode) |
| Backend     | Node.js + Express 5              |
| Real-time   | Socket.io                        |
| Autentizace | Better-Auth                      |
| ORM         | Drizzle ORM                      |
| Databáze    | SQLite (přes better-sqlite3)     |
| Styling     | CSS / Tailwind                   |

---

## Požadavky

* Node.js v18+
* npm v9+

---

## Spuštění projektu

### 1. Klonování repozitáře

```bash
git clone https://github.com/Ladkan/MeChat.git
cd mechat
```

---

### 2. Nastavení serveru

```bash
cd server
npm install
```

Vytvoř `.env` soubor ve složce `server/`:

```bash
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:8000
```

> Secret vygeneruješ pomocí: `npx @better-auth/cli secret`

Spusť migrace databáze (vytvoří `chat.db`):

```bash
npm run db:migrate
```

Spusť server:

```bash
npm run dev
```

Server poběží na `http://localhost:8000`.

---

### 3. Nastavení klienta

```bash
cd ../client
npm install
npm run dev
```

Klient poběží na `http://localhost:5173`.

---

## Environment Variables

### Server (`server/.env`)

| Proměnná             | Popis                               | Příklad                   |
| -------------------- | ----------------------------------- | ------------------------- |
| `BETTER_AUTH_SECRET` | Secret pro podepisování session | `openssl rand -base64 32` |
| `BETTER_AUTH_URL`    | Základní URL serveru                | `http://localhost:8000`   |

---

### Client (`client/.env`)

| Proměnná          | Popis                                      | Příklad                 |
| ----------------- | ------------------------------------------ | ----------------------- |
| `VITE_SERVER_URL` | URL serveru (volitelné, default localhost) | `http://localhost:8000` |

---

## Dostupné skripty

### Server

| Skript                | Popis                                      |
| --------------------- | ------------------------------------------ |
| `npm run dev`         | Spustí server s hot reloadem (`tsx watch`) |
| `npm run build`       | Přeloží TypeScript do `dist/`              |
| `npm start`           | Spustí produkční build                     |
| `npm run db:generate` | Vygeneruje migrace z Drizzle schématu      |
| `npm run db:migrate`  | Aplikuje migrace do `chat.db`              |
| `npm run db:studio`   | Otevře Drizzle Studio (GUI databáze)       |

---

### Client

| Skript            | Popis                     |
| ----------------- | ------------------------- |
| `npm run dev`     | Spustí Vite dev server    |
| `npm run build`   | Build pro produkci        |
| `npm run preview` | Náhled produkčního buildu |

---

## Funkce

* **Autentizace** — Registrace a přihlášení pomocí emailu a hesla (Better-Auth). Session jsou spravovány pomocí bezpečných HTTP-only cookies.
* **Chráněné routy** — Nepřihlášení uživatelé jsou přesměrováni na `/login` pomocí React Router `clientLoader`.
* **Real-time messaging** — Zprávy jsou okamžitě odesílány všem uživatelům v místnosti pomocí Socket.io.
* **Ukládání zpráv** — Zprávy jsou ukládány do SQLite a načítány při vstupu do místnosti.
* **Více místností** — Uživatelé se mohou připojovat a přepínat mezi místnostmi.
* **Indikace psaní** — Zobrazení „uživatel píše…“ v reálném čase.
* **Autentizované WebSockety** — Socket.io používá session cookie z Better-Auth (`io.use()` middleware).

---

## API

### Auth endpoints (Better-Auth)

| Metoda | Cesta                     | Popis                       |
| ------ | ------------------------- | --------------------------- |
| `POST` | `/api/auth/sign-up/email` | Registrace uživatele        |
| `POST` | `/api/auth/sign-in/email` | Přihlášení + session cookie |
| `POST` | `/api/auth/sign-out`      | Odhlášení                   |
| `GET`  | `/api/auth/get-session`   | Získání session             |

---

### Aplikační endpointy

| Metoda | Cesta                         | Popis                          |
| ------ | ----------------------------- | ------------------------------ |
| `GET`  | `/api/rooms/:roomId/messages` | Historie zpráv (vyžaduje auth) |
| `GET`  | `/api/rooms/:roomId`          | Detail místnosti               |
| `GET`  | `/api/rooms`                  | Seznam místností               |
| `POST` | `/api/rooms`                  | Vytvoření místnosti            |

---

### Socket.io eventy

| Event             | Směr            | Data                                         | Popis                      |
| ----------------- | --------------- | -------------------------------------------- | -------------------------- |
| `join_room`       | Client → Server | `roomId`                                     | Připojení do místnosti     |
| `send_message`    | Client → Server | `{ roomId, content }`                        | Odeslání zprávy            |
| `receive_message` | Server → Client | `{ id, content, sender, roomId, createdAt }` | Přijetí zprávy             |
| `typing`          | Client → Server | `{ roomId }`                                 | Informace o psaní          |
| `user_typing`     | Server → Client | `{ name }`                                   | Notifikace „uživatel píše“ |

---

## Databázové schéma

```
user          — id, name, email, emailVerified, image, createdAt, updatedAt
session       — id, expiresAt, token, userId, ipAddress, userAgent
account       — id, accountId, providerId, userId, password
verification  — id, identifier, value, expiresAt
room          — id, name, creatorId, createdAt
message       — id, content, roomId, userId, createdAt
```

> Tabulky `user`, `session`, `account` a `verification` jsou spravovány automaticky Better-Auth.

---

## Licence

MIT
