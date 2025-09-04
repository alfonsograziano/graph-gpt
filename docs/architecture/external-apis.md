# External APIs

## OpenAI API

- **Purpose:** LLM response generation and streaming
- **Documentation:** https://platform.openai.com/docs/api-reference
- **Base URL(s):** https://api.openai.com/v1
- **Authentication:** Bearer token (API key)
- **Rate Limits:** Based on usage tier and model

**Key Endpoints Used:**
- `POST /chat/completions` - Generate streaming LLM responses

**Integration Notes:** Implement streaming responses, context management, and error handling for API failures
