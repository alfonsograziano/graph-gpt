# Database Schema

## MongoDB Collections

```javascript
// conversations collection
{
  _id: ObjectId,
  id: String, // UUID for frontend reference
  title: String,
  createdAt: Date,
  updatedAt: Date,
  nodes: [
    {
      id: String,
      type: String, // 'input' | 'loading' | 'completed'
      userMessage: String,
      assistantResponse: String,
      position: {
        x: Number,
        y: Number
      },
      createdAt: Date,
      updatedAt: Date,
      parentNodeId: String // optional
    }
  ],
  edges: [
    {
      id: String,
      sourceNodeId: String,
      targetNodeId: String,
      type: String, // 'auto' | 'manual' | 'markdown'
      createdAt: Date,
      metadata: {
        markdownElementId: String, // optional
        contextSnippet: String // optional
      }
    }
  ],
  metadata: {
    nodeCount: Number,
    lastActiveNodeId: String, // optional
    tags: [String] // optional
  }
}

// Indexes
db.conversations.createIndex({ "id": 1 }, { unique: true })
db.conversations.createIndex({ "createdAt": -1 })
db.conversations.createIndex({ "updatedAt": -1 })
db.conversations.createIndex({ "nodes.id": 1 })
db.conversations.createIndex({ "edges.sourceNodeId": 1 })
db.conversations.createIndex({ "edges.targetNodeId": 1 })
```
