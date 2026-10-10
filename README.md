# PROG2002 Assessment 3 - Zhejiang Community Charity Events Platform

## 📌 Project Overview
This repository contains the source code and documentation for **Assessment 3**, developed for the **PROG2002 Web Development II** course at Guangxi University of Science and Technology. 

The application is a full-stack **Zhejiang Community Charity Events Platform**, designed to promote community charity runs, active living, and local welfare initiatives in Zhejiang Province. It enables users to browse community events, inspect detailed event info along with real-time participation lists, and submit online registrations.

---

## 📂 Repository Structure

```text
PROG2002-A3-ZhejiangRun-Team-16/
│
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