# FairLens

FairLens is a web application for exploring and reducing bias in machine-learning workflows. It provides a frontend interface backed by a FastAPI service, with a sample CSV included for local experimentation.

## Tech stack

- **Frontend:** Next.js, TypeScript, and npm
- **Backend:** FastAPI and Uvicorn
- **Data:** CSV upload and analysis workflows

## Prerequisites

- Node.js and npm
- Python 3.10 or later
- A Python virtual environment in `backend/venv`

## Run locally

### Windows

From the repository root, run:

```bat
run.bat
```

This starts the backend on `http://localhost:8000` and the frontend with the Next.js development server.

### Manual setup

Start the backend:

```bat
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

In a second terminal, start the frontend:

```bat
cd frontend
npm install
npm run dev
```

Open the frontend URL shown by Next.js in your browser.

## Project structure

```text
.
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
├── sample.csv
└── run.bat
```

## License

This project is distributed under the license in [LICENSE](LICENSE).
