# Developer Guide

Welcome to the Secure Data Sanitization and File Recovery System developer guide! This document provides instructions on how to set up the local development environment, start the backend API, and run the frontend React application.

---

## Project Structure Overview

This repository is split into two primary components:

1. **Backend Application (`app/`)**
   A Python-based FastAPI server handling API requests, file parsing, and system-level interactions (such as physical and logical drive detection via PowerShell).
2. **Frontend Application (`SIH-GUI/secureerase-sih/`)**
   A modern React web interface built with Vite, which interacts with the Python backend.

---

## Prerequisites

Before you start, make sure you have the following installed on your machine:
- **Node.js** (v16+ recommended) and **npm** for the frontend.
- **Python 3.8+** for the backend server.
- **Windows OS** with **PowerShell** (the backend script leverages PowerShell for scanning connected drives).
- **Admin privileges** (running the backend with Administrator privileges is required if you plan on running raw drive recovery endpoints).

---

## Setting Up the Test Disc

Open Windows Powershell in Administrator mode where the create-test-disk.ps is present.

Enter the following commands to successfully create the Test Disc:

```bash
Set-ExecutionPolicy -Scope Process Bypass

.\create-test-disk.ps1
```

After creating the Test Disc, add few files in it.

## Setting Up the Backend

The backend is a FastAPI server located in the `app/` folder.

### 1. Create and Activate a Virtual Environment
It is highly recommended to use a virtual environment to manage dependencies.
Open your terminal in the root directory (where this guide is located):

```bash
# Create a virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate
```

### 2. Install Dependencies
Install all required Python packages (including `fastapi`, `uvicorn`, and `pydantic`) using the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

### 3. Run the Backend Server
Start the backend using Uvicorn. Notice that the backend files are inside the `app/` directory, so you execute Uvicorn pointing to the `app.main` module:

```bash
# Run from the root directory
uvicorn app.main:app --reload
```

The backend API should now be running at: `http://localhost:8000`
You can also visit `http://localhost:8000/docs` to view the interactive API documentation (Swagger UI).

---

## Setting Up the Frontend

The frontend is a Vite + React application.

### 1. Navigate to the Frontend Directory
Open a new terminal window (keep the backend running in the first one) and navigate into the GUI folder:

```bash
cd SIH-GUI/secureerase-sih
```

### 2. Install Dependencies
Install all required Node.js packages using npm:

```bash
npm install
```

### 3. Run the Development Server
Start the Vite dev server:

```bash
npm run dev
```

The application should start automatically, usually accessible at `http://localhost:5173`. Open this URL in your browser to interact with the GUI.

---

## How it Works (Under the Hood)

- **API Flow:** The React frontend (on port `5173`) makes HTTP requests to the FastAPI backend (on port `8000`). Make sure your CORS configurations in `app/main.py` allow for this (it currently allows all origins `*`).
- **Disk Interactions:** Endpoints like `/api/drives` rely on `subprocess.run` calling Windows `powershell` commands (`Get-Disk`, `Get-Volume`). Ensure your local development setup permits executing these scripts.
- **Data Uploads:** Disk images uploaded via `/api/upload` are saved to a local `data/` folder (created automatically).
- **Recovery:** The recovery endpoint `/api/recover` delegates processing to a `RecoveryEngine` inside `app.recovery`.

---

## Troubleshooting

- **Powershell Commands Failing:** If your `Get-Disk` command fails, ensure you are running the backend in a terminal that has Administrator privileges, and ensure your system allows PowerShell script execution.
- **Port In Use:** If `8000` or `5173` are in use, specify a custom port:
  - Backend: `uvicorn app.main:app --reload --port 8080`
  - Frontend: `npm run dev -- --port 3000`
