# AgriBot Backend

This is the backend service for the AgriBot application, an AI-powered farming assistant.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd agribot/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the values in `.env` with your configuration

4. Set up the database:
```bash
# Create the database
createdb AgriBot
createdb AgriBot_test # for testing

# Run migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

5. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server
- `npm run build` - Build the TypeScript code
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── tests/          # Test files
```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

## Testing

Run tests with:
```bash
npm test
```

For watch mode:
```bash
npm run test:watch
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is licensed under the ISC License. 