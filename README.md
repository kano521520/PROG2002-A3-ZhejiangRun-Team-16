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