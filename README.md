# PROG2002 Assessment 3 - Zhejiang Community Charity Events Platform

## 📌 Project Overview
This repository contains the source code and documentation for **Assessment 3**, developed for the **PROG2002 Web Development II** course at Guangxi University of Science and Technology. 

The application is a full-stack **Zhejiang Community Charity Events Platform**, designed to promote community charity runs, active living, and local welfare initiatives in Zhejiang Province. It enables users to browse community events, inspect detailed event info along with real-time participation lists, and submit online registrations.

---

## 🚀 Getting Started (Install & Run)

### 1. Prerequisite
- Node.js 18+ and npm (verified with Node `v22.22.2` / npm `10.8.1`)

> ⚠️ **Important:** run `npm install` in the **repository root** (the folder containing `package.json` and `README.md`) — **not** inside `A3-client`.
> The root is configured as an **npm workspace** that owns the backend project `A3-api`, so one `npm install` at the root installs every backend dependency. `A3-client` is plain HTML/CSS/JS and has **no** npm dependencies.

### 2. Install dependencies

```bash
# Run from the repository root
npm install
```

Equivalent alternative (installing the backend directly):

```bash
cd A3-api
npm install
```

### 3. Start the backend API server

```bash
# Run from the repository root
npm start
```

Expected console output:

```text
Zhejiang Hope Run API server running at http://localhost:3000
Connected to SQLite database at: <repo>/db/charity_events.db
SQLite registrations table rebuilt with test data successfully.
```

### 4. Open the frontend

The API server also hosts the frontend, so simply open:

```text
http://localhost:3000/
```

That renders `A3-client/index.html` (event list, filter/search, details and registration pages are all served from the same origin).

Alternative: open `A3-client/index.html` directly in a browser, or serve the folder with a static server such as VS Code "Live Server" — the client calls `http://localhost:3000/api` and CORS is enabled, so both ways work.

### 5. Optional database scripts

| Command | Description |
| --- | --- |
| `npm run setup-db` | Re-creates the `categories` / `events` tables and re-seeds the sample events |
| `npm run update-db` | Migrates the `image_url` values of existing events |

### Available API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/categories` | List all event categories |
| GET | `/api/events` | List events (supports `?category_id=` and `?location=`) |
| GET | `/api/events/:id` | Single event detail plus its registrations |
| POST | `/api/registrations` | Submit a registration (JSON: `event_id`, `user_name`, `user_email`, `contact_number`, `tickets_purchased`) |

---

## 📂 Repository Structure

```text
PROG2002-A3-ZhejiangRun-Team-16/
│
├── package.json            # npm workspace root (run "npm install" / "npm start" here)
├── A3-api/                 # Backend Node.js & Express RESTful API server
│   ├── server.js           # Main server entry & API routing (Events & Registrations)
│   ├── setup-db.js         # Database initialization & table creation script
│   ├── update-db.js        # Database update and migration utility
│   ├── event_db.js         # Database connection configuration
│   ├── package.json        # Backend dependencies configuration
│   └── node_modules/       # Node modules packages
│
├── A3-client/              # Frontend User Interface (HTML / CSS / JavaScript)
│   ├── index.html          # Charity events homepage / list view
│   ├── main.js             # Homepage event fetching and rendering logic
│   ├── details.html        # Event details & current registrations table view
│   ├── details.js          # Dynamic single event & registrations fetch logic
│   ├── registration.html   # Event registration submission form
│   ├── registration.js     # Form validation and asynchronous POST request logic
│   └── style.css           # Global application styling and responsive layout
│
├── adminside/              # Optional administrative dashboard module (Reserved)
├── db/                     # SQLite Database storage
│   ├── charity_events.db   # SQLite database file
│   └── charityevents_db.sql# SQL schema & seed dump file
│
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation