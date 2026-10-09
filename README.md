# PROG2002 Assessment 2: Zhejiang Community Charity Events Platform

## Student Information
- **Student Name:** Xuanhao Zhang
- **Course:** PROG2002 Object-Oriented Application Development / Web Development
- **Project Title:** Zhejiang Community Charity Events Platform

---

## Project Overview
This full-stack web application enables users to explore and register for community charity running events across various cities in Zhejiang Province (e.g., Hangzhou, Ningbo, Shaoxing, Huzhou, Jiaxing, Wenzhou). 

The platform is built with a responsive vanilla HTML/CSS/JS frontend and a RESTful Express.js API backend connected to a local SQLite database (`charity_events.db`).

---

## Exact Directory Structure

```text
PROG2002-A2-ZhejiangRun/
├── db/                         # SQLite Database & SQL Schema Storage
│   ├── charity_events.db       # Active SQLite database file
│   └── charityevents_db.sql    # Raw SQL table schema & dump file
├── XuanhaoZhangA2-api/         # Express.js REST API Backend
│   ├── event_db.js             # Event database helper module
│   ├── package.json            # Node.js dependencies & scripts
│   ├── package-lock.json       # Dependency tree lockfile
│   ├── server.js               # Express server & API routes
│   ├── setup-db.js              # Database initialization & seeding script
│   ├── update-db.js             # Database patch & image update script
│   └── .gitignore              # Backend Git exclusion rules
├── XuanhaoZhangA2-client/      # Frontend Web Client
│   ├── details.html            # Event detail view & registration page
│   ├── details.js              # Fetch event details & submit registration
│   ├── index.html              # Main event discovery & search page
│   ├── main.js                 # Dynamic event grid & filter logic
│   ├── style.css               # Visual layout & card styling rules
│   └── .gitignore              # Frontend Git exclusion rules
├── .gitattributes              # Git repository attributes config
└── README.md                   # Complete project documentation