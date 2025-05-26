"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load test environment variables
dotenv_1.default.config({
    path: path_1.default.join(__dirname, '../../.env.test')
});
// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/AgriBot_test';
// Increase timeout for tests
jest.setTimeout(30000);
//# sourceMappingURL=setup.js.map