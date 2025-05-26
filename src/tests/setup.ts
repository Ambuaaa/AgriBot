import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({
  path: path.join(__dirname, '../../.env.test')
});

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/AgriBot_test';

// Increase timeout for tests
jest.setTimeout(30000); 