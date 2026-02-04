import logging
import os
from pathlib import Path

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, HTTPException, Request, UploadFile, status
from fastapi.responses import JSONResponse
from openai import APIError as OpenAIAPIError
from pinecone.exceptions import PineconeException

from .models import QuestionRequest, QAResponse
from .services.qa_service import answer_question
from .services.indexing_service import index_pdf_file

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="IKMS Multi-Agent RAG System",
    description=(
        "Intelligent Knowledge Management System powered by multi-agent RAG "
        "(Retrieval-Augmented Generation) with Context Critic filtering."
    ),
    version="0.1.0",
)

# Configure CORS - allow configurable origins for production
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(OpenAIAPIError)
async def openai_exception_handler(request: Request, exc: OpenAIAPIError) -> JSONResponse:
    """Handle OpenAI API errors with appropriate logging and response."""
    logger.error(f"OpenAI API error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": "AI service temporarily unavailable. Please try again."},
    )


@app.exception_handler(PineconeException)
async def pinecone_exception_handler(request: Request, exc: PineconeException) -> JSONResponse:
    """Handle Pinecone errors with appropriate logging and response."""
    logger.error(f"Pinecone error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": "Vector database service temporarily unavailable."},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler for unexpected errors with logging."""
    if isinstance(exc, HTTPException):
        raise exc

    logger.exception(f"Unhandled exception on {request.method} {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check() -> dict:
    """Health check endpoint for deployment monitoring."""
    return {"status": "healthy", "version": "0.1.0"}


@app.post("/qa", response_model=QAResponse, status_code=status.HTTP_200_OK)
async def qa_endpoint(payload: QuestionRequest) -> QAResponse:
    """Submit a question to the multi-agent RAG system.

    The question is processed through:
    1. Retrieval Agent - searches vector store
    2. Context Critic Agent - filters/ranks chunks
    3. Summarization Agent - generates draft answer
    4. Verification Agent - removes hallucinations
    """
    question = payload.question.strip()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="`question` must be a non-empty string.",
        )

    logger.info(f"Processing question: {question[:100]}...")

    try:
        result = answer_question(question)
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise

    logger.info("Question processed successfully")

    return QAResponse(
        answer                 = result.get("answer"),
        context                = result.get("context"),
        context_rationale      = result.get("context_rationale"),
        chunk_relevance_scores = result.get("chunk_relevance_scores"),
        draft_answer           = result.get("draft_answer"),
    )


@app.post("/index-pdf", status_code=status.HTTP_200_OK)
async def index_pdf(file: UploadFile = File(...)) -> dict:
    """Upload a PDF and index it into the vector database."""
    if file.content_type not in ("application/pdf",):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported.",
        )

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required.",
        )

    logger.info(f"Indexing PDF: {file.filename}")

    upload_dir = Path("data/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / file.filename

    try:
        contents = await file.read()
        file_path.write_bytes(contents)
        chunks_indexed = index_pdf_file(file_path)
    except Exception as e:
        logger.error(f"Error indexing PDF {file.filename}: {e}")
        raise

    logger.info(f"Successfully indexed {chunks_indexed} chunks from {file.filename}")

    return {
        "filename": file.filename,
        "chunks_indexed": chunks_indexed,
        "message": "PDF indexed successfully.",
    }