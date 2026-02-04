"""Agent implementations for the multi-agent RAG flow.

This module defines three LangChain agents (Retrieval, Summarization,
Verification) and thin node functions that LangGraph uses to invoke them.
"""
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()
import json
from typing import List

from langchain.agents import create_agent
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

from ..llm.factory import create_chat_model
from .prompts import (
    RETRIEVAL_SYSTEM_PROMPT,
    CONTEXT_CRITIC_SYSTEM_PROMPT,
    SUMMARIZATION_SYSTEM_PROMPT,
    VERIFICATION_SYSTEM_PROMPT,
)

from .state import QAState
from .tools import retrieval_tool

# Define agents at module level for reuse
retrieval_agent = create_agent(
    model=create_chat_model(),
    tools=[retrieval_tool],
    system_prompt=RETRIEVAL_SYSTEM_PROMPT,
)

context_critic_agent = create_agent(
      # model=create_chat_model(model_name="gpt-4o-mini", temperature=0.2),
    model = "gpt-4o-mini",
    tools=[],  # No tools needed, just analysis
    system_prompt=CONTEXT_CRITIC_SYSTEM_PROMPT,
)

summarization_agent = create_agent(
    model=create_chat_model(),
    tools=[],
    system_prompt=SUMMARIZATION_SYSTEM_PROMPT,
)

verification_agent = create_agent(
    model=create_chat_model(),
    tools=[],
    system_prompt=VERIFICATION_SYSTEM_PROMPT,
)

def _extract_last_ai_content(messages: List[object]) -> str: 
    """Extract the content of the last AIMessage in a messages list."""
    for msg in reversed(messages):
        if isinstance(msg, AIMessage):
            return str(msg.content)
    return ""

# def retrieval_node(state: QAState) -> QAState: 
    """Retrieval Agent node: gathers context from vector store.

    This node:
    - Sends the user's question to the Retrieval Agent.
    - The agent uses the attached retrieval tool to fetch document chunks.
    - Extracts the tool's content (CONTEXT string) from the ToolMessage.
    - Stores the consolidated context string in `state["context"]`.
    """
    question = state["question"]

    result = retrieval_agent.invoke({"messages": [HumanMessage(content=question)]})

    messages = result.get("messages", [])
    context  = ""
    
    for msg in reversed(messages)   : 
        if  isinstance(msg, ToolMessage): 
            context = str(msg.content)
            break

    return {
        "context":context,
    }

def retrieval_node(state: QAState) -> dict: 
    """Retrieval Agent node: gathers context from vector store.

    Enhanced to store both formatted context and raw documents for critic agent.
    """
    question = state["question"]

    result = retrieval_agent.invoke({"messages": [HumanMessage(content=question)]})

    messages = result.get("messages", [])
    context = ""
    raw_docs = []
    
    # Extract context from ToolMessage
    for msg in reversed(messages):
        if isinstance(msg, ToolMessage):
            context = str(msg.content)
            break
    
    # Try to extract raw documents from the tool result
    for msg in messages:
        if isinstance(msg, ToolMessage) and hasattr(msg, 'artifact'):
            if isinstance(msg.artifact, list):
                raw_docs = msg.artifact
    
    # Create individual chunk strings with IDs
    raw_context_blocks = []
    if context:
        if raw_docs:
            for i, doc in enumerate(raw_docs):
                chunk_text = f"[Chunk {i}]\n"
                if hasattr(doc, 'metadata') and doc.metadata:
                    if 'source' in doc.metadata:
                        chunk_text += f"Source: {doc.metadata['source']}\n"
                    if 'page' in doc.metadata:
                        chunk_text += f"Page: {doc.metadata['page']}\n"
                chunk_text += f"Content: {doc.page_content}\n"
                raw_context_blocks.append(chunk_text)
        else:
            # Fallback: split context by double newlines
            chunks = context.split('\n\n')
            raw_context_blocks = [
                f"[Chunk {i}]\nContent: {chunk.strip()}\n"
                for i, chunk in enumerate(chunks) if chunk.strip()
            ]

    return {
        "context": context,
        "raw_docs": raw_docs,
        "raw_context_blocks": raw_context_blocks,
    }

def context_critic_node(state: QAState) -> dict:
    """Context Critic Agent node: filters and ranks retrieved chunks using the agent.
    
    This node:
    - Uses the Context Critic Agent to analyze chunks
    - Agent assigns relevance scores and provides rationales
    - Filters out irrelevant chunks
    - Reorders chunks by relevance
    - Updates context with filtered chunks
    """
    question = state["question"]
    raw_context_blocks = state.get("raw_context_blocks", [])
    
    if not raw_context_blocks:
        return {
            "context_rationale": "No chunks retrieved to evaluate",
            "chunk_relevance_scores": []
        }
    
    # Prepare chunks for evaluation
    chunks_text = "\n\n".join([
        f"=== CHUNK {i} ===\n{chunk}"
        for i, chunk in enumerate(raw_context_blocks)
    ])
    
    # Create the user message for the critic agent
    user_message = f"""Question: {question}

Retrieved Chunks to Evaluate:
{chunks_text}

Analyze each chunk and provide your assessment in the following JSON format:
{{
    "chunks": [
        {{
            "chunk_id": 0,
            "relevance": "HIGHLY_RELEVANT|MARGINAL|IRRELEVANT",
            "rationale": "Brief explanation",
            "keep": true|false
        }}
    ],
    "summary": "Overall assessment of retrieval quality",
    "filtered_count": number_of_chunks_to_keep
}}"""
    
    try:
        # Invoke the Context Critic Agent (proper agent invocation)
        result = context_critic_agent.invoke(
            {"messages": [HumanMessage(content=user_message)]}
        )
        
        # Extract the agent's response
        messages = result.get("messages", [])
        response_content = _extract_last_ai_content(messages)
        
        # Parse JSON response
        try:
            # Extract JSON from response (handle markdown code blocks)
            content = response_content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            assessment = json.loads(content)
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw response: {response_content}")
            # Fallback: keep all chunks if parsing fails
            assessment = {
                "chunks": [
                    {
                        "chunk_id": i,
                        "relevance": "MARGINAL",
                        "rationale": "Parsing error - kept by default",
                        "keep": True
                    }
                    for i in range(len(raw_context_blocks))
                ],
                "summary": "JSON parsing failed - kept all chunks",
                "filtered_count": len(raw_context_blocks)
            }
        
        # Filter and reorder chunks
        chunk_scores = assessment.get("chunks", [])
        
        # Sort by relevance (HIGHLY_RELEVANT > MARGINAL > IRRELEVANT)
        relevance_order = {"HIGHLY_RELEVANT": 0, "MARGINAL": 1, "IRRELEVANT": 2}
        chunk_scores_sorted = sorted(
            chunk_scores,
            key=lambda x: relevance_order.get(x.get("relevance", "MARGINAL"), 1)
        )
        
        # Filter chunks marked to keep
        kept_chunks = [
            raw_context_blocks[chunk["chunk_id"]]
            for chunk in chunk_scores_sorted
            if chunk.get("keep", False) and chunk["chunk_id"] < len(raw_context_blocks)
        ]
        
        # Create filtered context
        filtered_context = "\n\n".join(kept_chunks) if kept_chunks else state.get("context", "")
        
        # Create human-readable rationale summary
        rationale_lines = [
            f"Context Critic Analysis for Question: \"{question}\"",
            "",
            f"📊 Statistics:",
            f"   • Retrieved: {len(raw_context_blocks)} chunks",
            f"   • Kept: {len(kept_chunks)} chunks",
            f"   • Filtered: {len(raw_context_blocks) - len(kept_chunks)} chunks",
            "",
            "📝 Chunk-by-Chunk Analysis:",
            ""
        ]
        
        for chunk in chunk_scores_sorted:
            emoji = {
                "HIGHLY_RELEVANT": "✅",
                "MARGINAL": "⚠️",
                "IRRELEVANT": "❌"
            }.get(chunk["relevance"], "❓")
            
            status = "KEPT" if chunk.get("keep") else "FILTERED"
            chunk_id = chunk['chunk_id']
            relevance = chunk['relevance']
            
            rationale_lines.append(
                f"{emoji} Chunk {chunk_id} - {relevance} [{status}]"
            )
            rationale_lines.append(
                f"   Rationale: {chunk.get('rationale', 'No rationale provided')}"
            )
            rationale_lines.append("")
        
        rationale_lines.append("📋 Overall Assessment:")
        rationale_lines.append(f"   {assessment.get('summary', 'No summary provided')}")
        rationale_lines.append("")
        rationale_lines.append(f"✨ Filtered Context: Keeping {len(kept_chunks)} most relevant chunks")
        
        context_rationale = "\n".join(rationale_lines)
        
        return {
            "context": filtered_context,
            "context_rationale": context_rationale,
            "chunk_relevance_scores": chunk_scores_sorted
        }
        
    except Exception as e:
        # Error handling: log and pass through original context
        print(f"Context Critic Agent Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "context"               : state.get("context", ""),
            "context_rationale"     : f"Critic agent error: {str(e)}. Using original context.",
            "chunk_relevance_scores": []
        }

def summarization_node(state:QAState) -> QAState: 
    """Summarization Agent node: generates draft answer from context.

    This node:
    - Sends question + context to the Summarization Agent.
    - Agent responds with a draft answer grounded only in the context.
    - Stores the draft answer in `state["draft_answer"]`.
    """

    question = state["question"]
    context  = state.get("context")
    
    user_content = f"Question: {question}\n\nContext:\n{context}" 

    result = summarization_agent.invoke(
        {"messages": [HumanMessage(content=user_content)]}
    )
    messages     = result.get("messages", [])
    draft_answer = _extract_last_ai_content(messages)

    return {
        "draft_answer": draft_answer,
    }

def verification_node(state: QAState) -> QAState: 
    """Verification Agent node: verifies and corrects the draft answer.

    This node:
    - Sends question + context + draft_answer to the Verification Agent.
    - Agent checks for hallucinations and unsupported claims.
    - Stores the final verified answer in `state["answer"]`.
    """
    question = state["question"]
    context = state.get("context", "")
    draft_answer = state.get("draft_answer", "")

    user_content = f"""Question: {question}

Context:
{context}

Draft Answer:
{draft_answer}

Please verify and correct the draft answer, removing any unsupported claims."""

    result = verification_agent.invoke(
        {"messages": [HumanMessage(content=user_content)]}
    )
    messages = result.get("messages", [])
    answer = _extract_last_ai_content(messages)

    return {
        "answer": answer,
    }