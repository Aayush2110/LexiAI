"""
LLM Service

Handles interaction with Large Language Models (OpenAI or Gemini).

What is an LLM?
- Large Language Model
- Trained on massive text data
- Generates human-like responses
- Understands context and nuance

Why OpenAI/Gemini?
- State-of-the-art performance
- Good instruction following
- Reliable API
- Production-ready

Temperature:
- 0.0: Deterministic, focused (best for factual Q&A)
- 0.5: Balanced creativity and consistency
- 1.0: Creative, varied responses
- Legal docs: Use 0.1-0.3 (accuracy over creativity)

Prompt Engineering:
- Critical for RAG quality
- Clear instructions prevent hallucinations
- Context formatting matters
- System prompts set behavior
"""

from typing import Optional
from langchain.chat_models import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, SystemMessage
from loguru import logger
from app.core.config import settings


class LLMService:
    """
    LLM Service
    
    Manages LLM interactions for answer generation.
    """
    
    def __init__(self):
        """Initialize LLM service based on configured provider"""
        
        self.provider = settings.LLM_PROVIDER
        logger.info(f"Initializing LLM service with provider: {self.provider}")
        
        if self.provider == "openai":
            self.llm = ChatOpenAI(
                model="gpt-3.5-turbo",  # or "gpt-4" for better quality
                temperature=settings.LLM_TEMPERATURE,
                max_tokens=settings.LLM_MAX_TOKENS,
                openai_api_key=settings.OPENAI_API_KEY
            )
            logger.info("OpenAI LLM initialized")
        
        elif self.provider == "gemini":
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-3.1-flash-lite-preview",
                temperature=settings.LLM_TEMPERATURE,
                max_output_tokens=settings.LLM_MAX_TOKENS,
                google_api_key=settings.GOOGLE_API_KEY,
                convert_system_message_to_human=True,
                request_timeout=60  # Add 60 second timeout
            )
            logger.info("Gemini LLM initialized")
        
        else:
            raise ValueError(f"Invalid LLM provider: {self.provider}")
    
    def generate_answer(
        self,
        question: str,
        context: str,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Generate answer using LLM
        
        Args:
            question: User's question
            context: Retrieved context from documents
            system_prompt: Optional custom system prompt
            
        Returns:
            str: Generated answer
        """
        
        try:
            # Default system prompt for legal RAG
            if not system_prompt:
                system_prompt = self._get_default_system_prompt()
            
            # Create user prompt with context and question
            user_prompt = self._create_user_prompt(question, context)
            
            logger.info("Generating answer from LLM")
            logger.debug(f"Question: {question}")
            logger.debug(f"Context length: {len(context)} characters")
            
            # Create messages
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            # Generate response
            response = self.llm.invoke(messages)
            answer = response.content
            
            logger.info("Answer generated successfully")
            logger.debug(f"Answer length: {len(answer)} characters")
            logger.debug(f"Answer preview: {answer[:200]}...")
            
            return answer
        
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise
    
    def _get_default_system_prompt(self) -> str:
        """
        Get default system prompt for legal RAG
        
        This prompt is crucial for:
        - Preventing hallucinations
        - Ensuring answers come from context
        - Maintaining professional tone
        - Handling missing information gracefully
        
        Returns:
            str: System prompt
        """
        
        return """You are a helpful AI assistant specialized in analyzing legal documents.

Your role:
1. Answer questions ONLY based on the provided context from uploaded documents
2. If the answer is not in the context, clearly state: "Answer not available in uploaded documents."
3. Provide accurate, professional, and concise responses
4. Cite specific sections or clauses when possible
5. Do NOT make up information or use external knowledge
6. Maintain a professional legal tone

Remember: Accuracy is more important than completeness. If unsure, say so."""
    
    def _create_user_prompt(self, question: str, context: str) -> str:
        """
        Create user prompt with context and question
        
        Format:
        - Context first (what the LLM should use)
        - Question second (what to answer)
        - Clear separation
        
        Args:
            question: User's question
            context: Retrieved context
            
        Returns:
            str: Formatted prompt
        """
        
        if not context or context.strip() == "":
            return f"""No relevant context found in the uploaded documents.

Question: {question}

Please respond that the answer is not available in the uploaded documents."""
        
        return f"""Context from uploaded documents:
{context}

---

Question: {question}

Please answer the question based ONLY on the context provided above. If the answer is not in the context, say "Answer not available in uploaded documents." """
    
    def generate_streaming_answer(
        self,
        question: str,
        context: str,
        system_prompt: Optional[str] = None
    ):
        """
        Generate streaming answer (for future implementation)
        
        Streaming provides:
        - Better user experience (see response as it generates)
        - Lower perceived latency
        - Ability to stop generation early
        
        Args:
            question: User's question
            context: Retrieved context
            system_prompt: Optional custom system prompt
            
        Yields:
            str: Answer chunks
        """
        
        # TODO: Implement streaming for production
        # For now, return full answer
        answer = self.generate_answer(question, context, system_prompt)
        yield answer


# Global instance
llm_service = LLMService()
