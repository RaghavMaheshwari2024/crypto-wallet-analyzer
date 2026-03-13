# Backend Server (Node.js + Express + TypeScript)

## Overview

This is the Node.js backend API server that handles:
- API Gateway and request routing
- External blockchain API integration (GoldRush, Tatum)
- MongoDB data persistence
- Background job processing
- Communication with Python processing server

## Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (MongoDB, env)
│   ├── routes/          # Express route definitions
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic layer
│   │   ├── goldrush.service.ts     # Covalent API integration
│   │   ├── tatum.service.ts        # Tatum API integration
│   │   ├── orchestrator.service.ts # API failover logic
│   │   ├── python.service.ts       # Python server client
│   │   └── ledger.service.ts       # Transaction ledger
│   ├── models/          # MongoDB schemas (Mongoose)
│   ├── jobs/            # Background job processors (Bull)
│   ├── middleware/      # Express middleware
│   └── index.ts         # Application entry point
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp ../.env.example ../.env

# Edit .env with your API keys
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Environment Variables

Required variables in `.env`:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crypto-wallet
GOLDRUSH_API_KEY=your_key_here
TATUM_API_KEY=your_key_here
PYTHON_SERVER_URL=http://localhost:8000
JWT_SECRET=your_secret_here
```

## API Endpoints

### Health Check
```
GET /health
```

### Wallet Analysis
```
POST /api/wallet/analyze
Body: { "address": "0x...", "chain": "ethereum" }
```

### Get Wallet
```
GET /api/wallet/:address
```

### Transaction History
```
GET /api/wallet/:address/history
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Docker

```bash
# Build image
docker build -t crypto-wallet-backend .

# Run container
docker run -p 5000:5000 --env-file ../.env crypto-wallet-backend
```

## Team Responsibilities

**Raghav (Alpha 1)**: Architecture, routing, auth middleware  
**Anmol (Alpha 2)**: Services layer (GoldRush, Tatum, Orchestrator, Python client)  
**Anhad (Alpha 3)**: Analytics service  
**Vijna (Alpha 4)**: Error handling middleware, testing
