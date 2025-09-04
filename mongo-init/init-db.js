// MongoDB initialization script
db = db.getSiblingDB("graph-gpt");

// Create a user for the application
db.createUser({
  user: "appuser",
  pwd: "apppassword",
  roles: [
    {
      role: "readWrite",
      db: "graph-gpt",
    },
  ],
});

// Create the conversations collection with proper indexes
db.createCollection("conversations");

// Create indexes for better performance
db.conversations.createIndex({ createdAt: -1 });
db.conversations.createIndex({ updatedAt: -1 });
db.conversations.createIndex({ title: "text" });

print("Database initialized successfully!");
