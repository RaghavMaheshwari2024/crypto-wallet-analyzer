# Python Processing Server (FastAPI)

## Overview

This is the Python-based data processing server that handles:
- Transaction data normalization across different blockchains
- Statistical aggregate computations
- Risk scoring algorithms
- Heavy numerical processing

## Structure

```
python-server/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config/
│   │   └── settings.py      # Configuration management
│   ├── db/
│   │   └── mongo.py         # MongoDB connection
│   ├── processors/
│   │   ├── normalize.py     # Transaction normalization (ANMOL)
│   │   ├── aggregates.py    # Statistical computations (ANHAD)
│   │   └── risk_engine.py   # Risk scoring (ANHAD)
│   ├── schemas/
│   │   ├── transaction.py   # Pydantic models
│   │   └── wallet.py
│   └── utils/
│       └── converters.py    # Unit conversion utilities
├── tests/
│   ├── test_normalize.py
│   └── test_aggregates.py
├── requirements.txt
└── Dockerfile
```

## Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Development

```bash
# Run server with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Run tests with coverage
pytest --cov=app tests/

# Format code
black app/
isort app/

# Type checking
mypy app/
```

## API Endpoints

### Health Check
```
GET /health
Response: { "status": "healthy", "service": "python-normalizer" }
```

### Normalize Transactions
```
POST /normalize
Body: {
  "transactions": [...],
  "chain": "ethereum"
}
Response: {
  "normalized": [...],
  "count": 10
}
```

### Compute Aggregates
```
POST /aggregates
Body: {
  "transactions": [...]
}
Response: {
  "total_volume": 123.45,
  "tx_count": 50,
  "avg_value": 2.47,
  ...
}
```

### Calculate Risk Score
```
POST /risk-score
Body: {
  "aggregates": {...}
}
Response: {
  "risk_score": 65.5,
  "risk_level": "medium",
  "factors": {...}
}
```

## Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_normalize.py

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov=app --cov-report=html tests/
```

## Docker

```bash
# Build image
docker build -t crypto-wallet-python .

# Run container
docker run -p 8000:8000 crypto-wallet-python
```

## Key Responsibilities

### Anmol (Alpha 2 - The Integrator)
**Primary Owner**: `processors/normalize.py`

Normalize transactions from different blockchains into unified format:
- Handle Ethereum (Wei → ETH conversion)
- Handle Bitcoin (Satoshi → BTC conversion)
- Handle Polygon, BSC (EVM-compatible)
- Timestamp parsing and standardization
- Error handling for missing/invalid data

### Anhad (Alpha 3 - The Analyst)
**Primary Owner**: `processors/risk_engine.py`, `processors/aggregates.py`

Compute risk scores and statistical metrics:
- Transaction frequency analysis
- Value concentration patterns
- Temporal anomaly detection
- Multi-factor risk scoring
- Statistical aggregates

## Code Quality Standards

- **Type hints**: All functions must have type annotations
- **Docstrings**: Use Google-style docstrings
- **Testing**: Minimum 80% code coverage
- **Formatting**: Use `black` and `isort`
- **Linting**: Must pass `flake8` checks

## Example: Normalization

```python
from app.processors.normalize import TransactionNormalizer

normalizer = TransactionNormalizer()

# Ethereum transaction
eth_tx = {
    "tx_hash": "0x123...",
    "from_address": "0xabc...",
    "to_address": "0xdef...",
    "value": "1000000000000000000",  # 1 ETH in Wei
    "block_signed_at": "2024-01-01T00:00:00Z"
}

normalized = normalizer.normalize_ethereum_tx(eth_tx)
# Result: { "value": 1.0, "timestamp": 1704067200, ... }
```

## Performance Targets

- Normalization: 1000+ tx/minute
- Aggregates: <500ms for 500 transactions
- Risk scoring: <200ms per wallet
