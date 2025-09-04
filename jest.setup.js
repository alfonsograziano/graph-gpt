// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/graph-gpt-test";
