# PROG2002 Assessment 3 - Zhejiang Community Charity Events Platform (Angular v22+ Upgrade)

## 📌 Project Overview
This repository contains the source code and documentation for Assessment 3, developed for the **PROG2002 Web Development II** course at Guangxi University of Science and Technology.

The application is a full-stack **Zhejiang Community Charity Events Platform**, designed to promote community charity runs, active living, and local welfare initiatives in Zhejiang Province. It enables users to browse community events, inspect detailed event info along with real-time participation lists, inspect live weather forecasts per location, and submit online registrations.

### 🌟 High-Grade Architecture Upgrade (>65% Distinction Level)
To meet the high-grade criteria (>65%), the client-side architecture evolved from a static HTML/JS interface into a modern **Single Page Application (SPA)** powered by **Angular (v22+) & TypeScript**, integrated with a **Real-Time Open-Meteo Weather API Proxy**.

---

## 🚀 Getting Started (Install & Run)

### 1. Prerequisites
- **Node.js**: Node.js 18+ (tested with Node.js v20.18.0 / v22+)
- **Angular CLI**: Angular CLI 18+ / 22+

---

### 2. Step 1: Start the Backend API Server (`A3-api`)

Open a terminal at the repository root (`PROG2002-A3-ZhejiangRun-Team-16`):

```bash
# Install backend dependencies
cd A3-api
npm install

# Start the Express API Server
node server.js

```

**Expected Console Output:**

```text
Connected to SQLite database at: <repo>/db/charity_events.db
SQLite database initialized with test data.
API server running at http://localhost:3000

```

---

### 3. Step 2: Start the Angular Single Page Application (`A3-angular-client`)

Open a **second terminal** window at the repository root:

```bash
# Navigate to the Angular Client directory
cd A3-angular-client

# Install frontend dependencies (if not installed)
npm install

# Launch Angular Development Server
npm start

```

Once compiled, open your browser and visit:

👉 **`http://localhost:4200/`**

---

### 4. Legacy Baseline Client (`A3-client`)

The original HTML5/JS client is retained in `/A3-client` as a baseline reference.
It can be accessed via `http://localhost:3000/` while `A3-api` is running.

---

## 🛠️ Key Architectural Upgrades & Technical Stack

### 1. Frontend Architecture: Angular (v22+) & TypeScript

* **Component-Driven Architecture**: Refactored static pages into reusable Angular TypeScript standalone components (`AppComponent`).
* **Reactive State & Async Data Flow**: Built `ApiService` using Angular `HttpClient` and RxJS `Observable` pipelines.
* **Type Safety**: Strictly modeled domain entities (`CharityEvent`, `WeatherInfo`) in `models.ts` using TypeScript interfaces.
* **Sticky Locking & Modern UI**: Enhanced user experience with dynamic card selection, form validation, and CSS sticky-positioning for instant event registration.

### 2. Backend & Weather API Integration (`A3-api`)

* **Express Proxy for Weather API**: Implemented `/api/weather` endpoint connecting to Open-Meteo Geocoding & Forecast APIs.
* **Zhejiang Geocoding Mapping**: Features a fallback dictionary (`CITY_COORDINATES`) covering major Zhejiang cities (Hangzhou, Ningbo, Wenzhou, Shaoxing, etc.) to guarantee 100% weather resolution per event location.
* **SQLite Database Integration**: Handles relational queries, registration constraints (`UNIQUE(event_id, user_name)`), and atomic deletions.

---

## 🔌 Available RESTful API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/categories` | List all event categories |
| `GET` | `/api/events` | List events (supports `?category_id=` and `?location=`) |
| `GET` | `/api/events/:id` | Single event detail along with active user registrations |
| `POST` | `/api/events` | Create a new charity event |
| `DELETE` | `/api/events/:id` | Remove an event (blocked if registrations exist) |
| `POST` | `/api/registrations` | Submit a registration (with duplicate name check) |
| `GET` | `/api/weather` | Fetch live temperature & condition (`?location=CityName`) |

---

## 📂 Repository Structure

```text
PROG2002-A3-ZhejiangRun-Team-16/
│
├── A3-api/                     # Node.js & Express RESTful API + SQLite Server
│   ├── server.js               # Main server entry, Event/Registration & Weather API routes
│   ├── setup-db.js             # Database setup & seeding script
│   ├── update-db.js            # Database migration script
│   ├── event_db.js             # Database connection setup
│   └── package.json            # Backend dependencies
│
├── A3-angular-client/          # 【High-Grade Upgrade】Angular v22+ TypeScript SPA
│   ├── src/
│   │   └── app/
│   │       ├── models.ts       # TypeScript domain interface definitions
│   │       ├── api.service.ts  # Angular HttpClient service for Express API & Weather API
│   │       ├── app.component.ts# Main Angular logic component
│   │       ├── app.component.html # Responsive layout with sticky registration form
│   │       └── app.component.css  # Modern UI styles & sticky positioning rules
│   └── package.json            # Angular project configuration
│
├── A3-client/                  # Legacy HTML/JS client baseline
│   ├── index.html              # Event listing view
│   ├── main.js                 # Event list fetch logic
│   ├── details.html            # Event details view
│   ├── details.js              # Event details fetch logic
│   ├── registration.html       # Registration submission page
│   ├── registration.js         # Form logic
│   └── style.css               # Legacy styles
│
├── adminside/                  # Reserved administrative module
├── db/                         # SQLite Database storage
│   ├── charity_events.db       # SQLite database file
│   └── charityevents_db.sql    # Schema & seed script
│
└── README.md                   # Project documentation

```

---

## 👥 Task Allocation Table

| Team Member | Primary Roles & Key Contributions | Contribution % |
| --- | --- | --- |
| **Xuanhao Zhang** | Angular v22+ SPA Architecture Migration, TypeScript Interface Modeling, `ApiService` Weather Integration, Express Weather Proxy Route Refactoring. | **60%** |
| **Zhaoze Sun** | Event Management API Testing, Database Integrity Verification, Baseline UI Styling, Report Documentation & Video Demo Recording. | **40%** |
