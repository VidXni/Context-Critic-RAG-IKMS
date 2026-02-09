## Project Overview

**Context Critic IKMS** is a Multi-Agent RAG (Retrieval-Augmented Generation) system featuring a novel Context Critic Agent that intelligently filters and ranks retrieved document chunks before answer generation. It combines a React frontend with a Python FastAPI backend for intelligent document Q&A.

## Build & Run Commands

### Backend (Python FastAPI)

```bash
# Install dependencies (using uv package manager)
uv sync

# Run development server (with hot reload)
python -m uvicorn src.app.api:app --reload

# Server runs at http://localhost:8000
# API docs available at /docs and /redoc
```

### Frontend (React + Vite)

```bash
cd ikms-frontend

# Install dependencies
npm install

# Development server (HMR at localhost:5173)
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

## Architecture

### Multi-Agent RAG Pipeline

The system uses LangGraph to orchestrate a 4-agent pipeline:

1. **Retrieval Agent** (`retrieval_node`) - Searches Pinecone vector store for relevant chunks
2. **Context Critic Agent** (`context_critic_node`) - Filters/ranks chunks by relevance (HIGHLY_RELEVANT/MARGINAL/IRRELEVANT)
3. **Summarization Agent** (`summarization_node`) - Generates draft answer from filtered context
4. **Verification Agent** (`verification_node`) - Removes hallucinations from draft answer

Pipeline flow is defined in `src/app/core/agents/graph.py` using LangGraph's `StateGraph`.

### Backend Structure

```
src/app/
├── api.py                    # FastAPI app with /qa and /index-pdf endpoints
├── models.py                 # Pydantic request/response models
├── core/
│   ├── config.py             # Pydantic Settings (loads from .env)
│   ├── agents/
│   │   ├── graph.py          # LangGraph orchestration (run_qa_flow)
│   │   ├── agents.py         # Agent node implementations
│   │   ├── prompts.py        # System prompts for each agent
│   │   ├── state.py          # QAState TypedDict
│   │   └── tools.py          # retrieval_tool definition
│   └── retrieval/
│       ├── vector_store.py   # Pinecone integration
│       └── serialization.py  # Document formatting
└── services/
    ├── qa_service.py         # QA business logic
    └── indexing_service.py   # PDF indexing logic
```

### Frontend Structure

```
ikms-frontend/src/
├── main.jsx                  # React root
├── App.jsx                   # Layout wrapper
├── pages/
│   └── Home.jsx              # Main workflow (upload → ask → answer)
├── components/
│   ├── common/               # Button, Card, Input, Loader
│   ├── layout/               # Header, Layout
│   └── features/
│       ├── indexing/         # PDFUpload, IndexingStatus
│       └── qa/               # QuestionForm, AnswerDisplay, ChunkRelevanceDisplay
├── hooks/
│   ├── useQA.js              # QA state management
│   └── useIndexing.js        # PDF upload state
└── api/
    └── client.js             # Axios client (API_BASE_URL from env)
```

### Key Technologies

- **Backend**: FastAPI, LangChain, LangGraph, Pinecone, OpenAI (GPT-4o-mini, text-embedding-3-small)
- **Frontend**: React 18, Vite, TailwindCSS, Axios, Lucide icons

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
OPENAI_API_KEY=your-openai-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=stemlink-ikms

# Optional (with defaults)
OPENAI_MODEL_NAME=gpt-4o-mini
OPENAI_EMBEDDING_MODEL_NAME=text-embedding-3-small
RETRIEVAL_K=4
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Frontend
VITE_API_BASE_URL=http://localhost:8000
```

## API Endpoints

- `GET /health` - Health check for deployment monitoring
- `POST /qa` - Submit question, returns answer with context critic analysis
- `POST /index-pdf` - Upload PDF file for indexing into vector store

## Deployment

**Backend:**
```bash
uv sync --frozen --no-dev
uv run uvicorn src.app.api:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd ikms-frontend
npm ci
npm run build
# Serve dist/ with nginx or any static file server
```

### Production Checklist

- Set all required environment variables
- Configure `CORS_ORIGINS` for your production domain
- Use `LOG_LEVEL=WARNING` or `ERROR` in production
- Ensure Pinecone index exists and is configured
- Set up health check monitoring at `/health`

## State Flow

The `QAState` TypedDict (in `state.py`) threads through all agents:
- `question`, `context`, `draft_answer`, `answer` - Core fields
- `raw_docs`, `raw_context_blocks` - For context critic input
- `context_rationale`, `chunk_relevance_scores` - Context critic output (exposed to frontend)

## UI Color Scheme

The UI uses blue shades as primary colors, with green for success states (verified answers, kept chunks) and red for error states (filtered chunks, irrelevant items).
