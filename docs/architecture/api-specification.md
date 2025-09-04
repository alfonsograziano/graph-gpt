# API Specification

## REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Graph-GPT API
  version: 1.0.0
  description: API for graph-based LLM conversation interface
servers:
  - url: /api
    description: Next.js API routes
paths:
  /conversations:
    get:
      summary: Get all conversations
      responses:
        '200':
          description: List of conversations
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Conversation'
    post:
      summary: Create new conversation
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
      responses:
        '201':
          description: Conversation created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Conversation'
  /conversations/{id}:
    get:
      summary: Get conversation by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Conversation details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Conversation'
    put:
      summary: Update conversation
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Conversation'
      responses:
        '200':
          description: Conversation updated
    delete:
      summary: Delete conversation
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Conversation deleted
  /chat:
    post:
      summary: Send message to LLM
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                context:
                  type: array
                  items:
                    type: object
                    properties:
                      role:
                        type: string
                        enum: [user, assistant]
                      content:
                        type: string
                nodeId:
                  type: string
      responses:
        '200':
          description: Streaming LLM response
          content:
            text/event-stream:
              schema:
                type: string
components:
  schemas:
    Conversation:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        nodes:
          type: array
          items:
            $ref: '#/components/schemas/Node'
        edges:
          type: array
          items:
            $ref: '#/components/schemas/Edge'
    Node:
      type: object
      properties:
        id:
          type: string
        conversationId:
          type: string
        type:
          type: string
          enum: [input, loading, completed]
        userMessage:
          type: string
        assistantResponse:
          type: string
        position:
          $ref: '#/components/schemas/Position'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    Edge:
      type: object
      properties:
        id:
          type: string
        conversationId:
          type: string
        sourceNodeId:
          type: string
        targetNodeId:
          type: string
        type:
          type: string
          enum: [auto, manual, markdown]
    Position:
      type: object
      properties:
        x:
          type: number
        y:
          type: number
```
