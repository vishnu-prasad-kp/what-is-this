# What Is This? — AI-Powered Visual Object Identifier

An AI vision application built with **React**, **FastAPI**, **Groq Llama 3.2 Vision**, and **SQLite**.

Take a photo or upload an image, and the AI model accurately identifies the object, explains its purpose in plain language, outlines common uses, highlights key context, and presents critical safety guidance when applicable.

---

## Features (Phase 1 Implemented)

- 🖼️ **Image Upload & Drag-and-Drop**: Drag images directly into the browser or browse from disk (JPEG, PNG, WebP).
- 📷 **Camera Scan Trigger**: Immediate action button configured for camera capture devices.
- ⚡ **Groq Llama 3.2 Vision Model**: Ultra-fast multimodal inference powered by `llama-3.2-11b-vision-preview` or `llama-3.2-90b-vision-preview`.
- 🔍 **Structured JSON Results**:
  - Identified Object Name
  - Confidence Level (`high`, `medium`, `low`)
  - Plain-language explanation ("What is it?")
  - Common practical uses as interactive tags
  - Important context & material information
  - Prominent Safety Advisory for hazardous items
- 🔊 **Voice Audio Output**: Built-in Text-to-Speech (`window.speechSynthesis`) to read the object's description aloud.
- 💬 **Follow-up Question Modal**: Interactive follow-up Q&A capability for the identified object.
- 🗄️ **Persistent Scan History**: Automatically saves every scan into an SQLite database (`scans.db`) with thumbnail previews and one-click deletion.
- 🧪 **Offline / Demo Simulation Mode**: Runs immediately even before adding a Groq API key, providing realistic test responses.

---

## Project Structure

```
what-is-this/
├── backend/
│   ├── app/
│   │   ├── config.py             # Settings, env vars & validation
│   │   ├── database.py           # SQLite database connection & ScanRecord model
│   │   ├── schemas.py            # Pydantic schemas (AnalysisResult, ScanResponse)
│   │   ├── services/
│   │   │   ├── ai_service.py     # Groq Vision API client & fallback handler
│   │   │   └── storage_service.py# Image validation, resizing, and saving
│   │   ├── routes/
│   │   │   ├── analysis.py       # POST /api/analyze, GET /api/scans/{id}
│   │   │   └── history.py        # GET /api/history, DELETE /api/history/{id}
│   │   └── main.py               # FastAPI app, CORS, static uploads
│   ├── uploads/                  # Uploaded images directory
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── index.html                # Inter / Plus Jakarta Sans fonts, meta tags
│   ├── package.json
│   ├── vite.config.js            # Vite config with backend proxy
│   └── src/
│       ├── App.jsx               # Main state & view coordinator
│       ├── index.css             # Vanilla CSS design system, dark mode & laser HUD
│       ├── components/
│       │   ├── Navbar.jsx        # Branding and API status indicator
│       │   ├── ImageUploader.jsx # Drag-drop zone, camera trigger & sample chips
│       │   ├── ScanLoading.jsx   # Radar laser scanning beam animation
│       │   ├── AnalysisResult.jsx# Structured result display, TTS & Q&A
│       │   └── RecentScans.jsx   # Past scans grid with delete actions
│       └── services/
│           └── api.js            # API client
└── README.md
```

---

## Setup & Running Instructions

### 1. Backend Setup (FastAPI)

1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your Groq API Key:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `backend/.env` and insert your Groq API key:
     ```env
     GROQ_API_KEY=gsk_your_actual_groq_api_key_here
     GROQ_MODEL=llama-3.2-11b-vision-preview
     ```
   *(Note: If left empty, the application runs in **Demo Simulation Mode** so you can test all features immediately).*

5. Start the FastAPI backend:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - API Docs will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### 2. Frontend Setup (React + Vite)

1. Open a separate terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - The application will be running at [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Uploads an image, triggers AI vision inference, saves to SQLite, and returns structured result. |
| `GET` | `/api/scans/{id}` | Retrieves a saved scan record by ID. |
| `GET` | `/api/history` | Lists recent scans in reverse chronological order. |
| `DELETE` | `/api/history/{id}` | Deletes a scan record and removes the saved image file. |
| `GET` | `/api/status` | Reports API status and whether a live Groq key is active. |

---

## Roadmap

- **Phase 1 (Completed)**: Image upload → Groq Llama 3.2 Vision analysis → Structured result page + SQLite persistence + audio speech output + setup instructions.
- **Phase 2 (Completed)**: Direct in-browser live webcam viewfinder with sci-fi HUD reticle, camera switcher, snapshot freeze review, and canvas capture.
- **Phase 3 (Completed)**: Contextual conversational multi-turn Q&A backend endpoint (`POST /api/scans/{id}/ask`), Voice Input (Speech-to-Text), quick prompt chips, and interactive chat interface.

