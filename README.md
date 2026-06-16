# JobFinder 🚀

A modern, fast, and responsive remote job search engine built with pure vanilla technologies. Discover your next career move by searching thousands of remote opportunities worldwide.

---

[**Live Demo**](FILL_IN_YOUR_LIVE_DEMO_LINK_HERE) | [**Repository**](FILL_IN_YOUR_REPO_LINK_HERE)

---

## 🌟 Overview

**JobFinder** is a single-page application (SPA) that connects job seekers with thousands of remote positions. It pulls real-time data from the [Remotive API](https://remotive.com/api/remote-jobs), allowing users to find, filter, and track their favorite remote jobs.

### Key Features
- **Real-Time Data**: Fetches the latest job listings directly from the Remotive public API.
- **Dynamic Filtering**: Live search by keyword/role, location, and job category.
- **Persistant Favorites**: Save jobs to your personal "My Saved Jobs" list, which remains available even after refreshing the page or closing the browser.
- **Smart Category Sync**: Automatically generates the category dropdown from the actual jobs available, ensuring you never select a category that has no listings.
- **Responsive Design**: A mobile-first, card-based UI that looks great on desktops, tablets, and phones.

## 🎯 Why This Project?

This project was developed as part of a **freeCodeCamp** certification to practice core web development skills without the abstraction of frameworks. The primary learning objectives were:
- Consuming and handling real-world REST APIs using `fetch` and `async/await`.
- Implementing complex, multi-criteria client-side filtering.
- Managing application state and persistent storage using the `localStorage` API.
- Building a performant UI with CSS Grid and accessible DOM manipulation.

## 🛠️ Tech Stack

- **HTML5**: Semantic structure for accessibility and SEO.
- **CSS3**: Modern layout techniques (CSS Grid, Flexbox) and a custom design system with Inter-variable typography.
- **JavaScript (ES6+)**: Vanilla logic for fetching, filtering, and local storage management.
- **Data Source**: Remotive Public API (No API key required).

## ⚙️ How It Works Internally

### 1. Data Fetching & Sync
On initial load, the app fetches the entire list of remote jobs. To overcome common CORS issues found in some API endpoints, the **Category List** is derived dynamically from the job objects themselves using a `Set` to filter unique values. This guarantees that the filter dropdown always matches the current job data.

### 2. Unified Filtering Logic
A central `applyFilters()` function handles the application state. It reads the current values of the keyword, location, and category inputs simultaneously. This "Single Source of Truth" approach ensures the "Showing X jobs" counter and the results grid are always in perfect sync.

### 3. Local Storage Persistence
When a user "saves" a job, the full job object is stored in a `JSON` array inside the browser's `localStorage`. The UI re-checks this storage on every render to correctly display the "Saved" status (★) across different sessions.

## ⚠️ Known Limitations

- **Location Filtering**: Remotive's API does not provide a location-based search parameter. As a result, location filtering is performed via case-insensitive text matching on the `candidate_required_location` field in the client-side data.
- **External Hand-off**: Clicking "View Details" opens the original listing on Remotive. Users may occasionally encounter a brief Cloudflare verification page on Remotive's site; this is a standard security measure on their platform and is independent of this application.

## 🚀 Running Locally

You can run this project in two ways:

### Option 1: Direct Open
Simply double-click `index.html` to open it in your browser. (Note: Some browsers may occasionally block API fetches from a `file://` protocol due to security settings).

### Option 2: Local Server (Recommended)
Using a local server ensures consistent performance and API fetching. If you have Python installed, run this command in the project folder:

```bash
python -m http.server 8000
```
Then, open your browser and navigate to `http://localhost:8000`.

---
*Created with ❤️ for freeCodeCamp.*
