# 🚀 Anmol's Quick Start Guide

This guide is specifically for **Anmol Mishra (Alpha 2 - The Integrator)** to get started with your tasks.

---

## 📋 Your Responsibilities

You are the **Integration Layer Owner**. Your code sits between external APIs and internal processing.

### Core Tasks:
1. ✅ **DONE**: Backend structure, GoldRush API integration, MongoDB setup
2. 🔄 **IN PROGRESS**: Monorepo structure creation
3. ⏳ **NEXT**: Tatum API service + Orchestrator
4. ⏳ **CRITICAL**: Python normalization engine

---

## 🎯 Step-by-Step: What to Do Next

### **PHASE 1: Migrate Your Existing Code** (30 minutes)

```bash
# 1. Download the monorepo structure (from this conversation)
# 2. Navigate to your existing blockchain_server repo

cd /path/to/blockchain_server

# 3. Copy your existing code to the new structure
cp -r src/* /path/to/crypto-wallet-analyzer/backend/src/
cp package.json /path/to/crypto-wallet-analyzer/backend/
cp tsconfig.json /path/to/crypto-wallet-analyzer/backend/

# 4. Push to GitHub
cd /path/to/crypto-wallet-analyzer
git init
git add .
git commit -m "Initial monorepo setup with existing backend code"
git branch -M main
git remote add origin https://github.com/yourusername/crypto-wallet-analyzer.git
git push -u origin main
```

---

### **PHASE 2: Build Tatum Service** (2-3 hours)

Create: `backend/src/services/tatum.service.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

interface TatumTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  // Add more fields as needed
}

export class TatumService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.TATUM_API_KEY || '';
    this.client = axios.create({
      baseURL: 'https://api.tatum.io/v3',
      headers: {
        'x-api-key': this.apiKey,
      },
      timeout: 10000,
    });
  }

  /**
   * Fetch transaction history for a given address
   * @param address - Wallet address
   * @param chain - Blockchain network (ethereum, bitcoin, polygon, etc.)
   * @returns Array of transactions
   */
  async fetchTransactionHistory(
    address: string,
    chain: string
  ): Promise<TatumTransaction[]> {
    try {
      const endpoint = this.getChainEndpoint(chain);
      const response = await this.client.get(
        `/${endpoint}/account/${address}/transactions`
      );
      
      return response.data;
    } catch (error) {
      console.error(`Tatum API error for ${chain}:`, error);
      throw new Error(`Failed to fetch transactions from Tatum: ${error}`);
    }
  }

  /**
   * Map chain name to Tatum API endpoint
   */
  private getChainEndpoint(chain: string): string {
    const chainMap: { [key: string]: string } = {
      ethereum: 'ethereum',
      bitcoin: 'bitcoin',
      polygon: 'polygon',
      bsc: 'bsc',
    };
    
    return chainMap[chain.toLowerCase()] || chain;
  }

  /**
   * Get account balance
   */
  async getBalance(address: string, chain: string): Promise<string> {
    try {
      const endpoint = this.getChainEndpoint(chain);
      const response = await this.client.get(
        `/${endpoint}/account/${address}/balance`
      );
      
      return response.data.balance;
    } catch (error) {
      console.error(`Failed to get balance from Tatum:`, error);
      throw error;
    }
  }
}
```

**Test it:**
```bash
cd backend
npm install
npm run dev
# Make a test API call to verify it works
```

---

### **PHASE 3: Build Orchestrator with Failover** (2 hours)

Create: `backend/src/services/orchestrator.service.ts`

```typescript
import { GoldRushService } from './goldrush.service';
import { TatumService } from './tatum.service';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  chain: string;
}

export class BlockchainOrchestratorService {
  private goldRush: GoldRushService;
  private tatum: TatumService;
  private failoverCount: number = 0;

  constructor() {
    this.goldRush = new GoldRushService();
    this.tatum = new TatumService();
  }

  /**
   * Fetch transactions with automatic failover
   * Try GoldRush first, fallback to Tatum if it fails
   */
  async fetchTransactions(
    address: string,
    chain: string
  ): Promise<Transaction[]> {
    try {
      console.log(`[Orchestrator] Trying GoldRush for ${address}...`);
      const transactions = await this.goldRush.fetchTransactionHistory(
        address,
        chain
      );
      
      console.log(`[Orchestrator] ✅ GoldRush succeeded`);
      return transactions;
      
    } catch (goldRushError) {
      console.warn(`[Orchestrator] ⚠️ GoldRush failed, trying Tatum...`);
      this.failoverCount++;
      
      try {
        const transactions = await this.tatum.fetchTransactionHistory(
          address,
          chain
        );
        
        console.log(`[Orchestrator] ✅ Tatum succeeded (failover #${this.failoverCount})`);
        return transactions;
        
      } catch (tatumError) {
        console.error(`[Orchestrator] ❌ Both APIs failed`);
        throw new Error('All blockchain API providers failed');
      }
    }
  }

  /**
   * Get failover statistics
   */
  getFailoverStats() {
    return {
      totalFailovers: this.failoverCount,
      primaryProvider: 'GoldRush',
      backupProvider: 'Tatum',
    };
  }
}
```

---

### **PHASE 4: Python Normalization Engine** (4-5 hours) - **YOUR CORE CONTRIBUTION**

Create: `python-server/app/main.py`

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Crypto Wallet Analyzer - Processing Server",
    description="Python server for transaction normalization and analytics",
    version="1.0.0"
)

# Request/Response models
class NormalizeRequest(BaseModel):
    transactions: List[Dict[str, Any]]
    chain: str

class NormalizeResponse(BaseModel):
    normalized: List[Dict[str, Any]]
    count: int

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "python-normalizer",
        "version": "1.0.0"
    }

@app.post("/normalize", response_model=NormalizeResponse)
async def normalize_transactions(request: NormalizeRequest):
    """
    Normalize transactions from different blockchains
    """
    try:
        from app.processors.normalize import TransactionNormalizer
        
        normalizer = TransactionNormalizer()
        normalized = []
        
        for tx in request.transactions:
            normalized_tx = normalizer.normalize_transaction(tx, request.chain)
            normalized.append(normalized_tx)
        
        logger.info(f"Normalized {len(normalized)} transactions for chain: {request.chain}")
        
        return NormalizeResponse(
            normalized=normalized,
            count=len(normalized)
        )
    
    except Exception as e:
        logger.error(f"Normalization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

Create: `python-server/app/processors/normalize.py`

```python
from typing import Dict, Any
from decimal import Decimal
from dateutil import parser
import logging

logger = logging.getLogger(__name__)

class TransactionNormalizer:
    """
    Normalize transactions from different blockchain formats into unified schema
    
    This is the CORE of your contribution - handles data heterogeneity
    """
    
    def normalize_transaction(self, raw_tx: Dict[str, Any], chain: str) -> Dict[str, Any]:
        """
        Main entry point - routes to chain-specific normalizer
        
        Args:
            raw_tx: Raw transaction data from API
            chain: Blockchain identifier (ethereum, bitcoin, polygon, etc.)
        
        Returns:
            Normalized transaction with standard fields
        """
        chain_lower = chain.lower()
        
        if chain_lower in ['ethereum', 'polygon', 'bsc']:
            return self.normalize_ethereum_tx(raw_tx)
        elif chain_lower == 'bitcoin':
            return self.normalize_bitcoin_tx(raw_tx)
        else:
            logger.warning(f"Unsupported chain: {chain}, using generic normalizer")
            return self.normalize_generic_tx(raw_tx, chain)
    
    def normalize_ethereum_tx(self, raw_tx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize Ethereum and EVM-compatible transactions
        
        GoldRush returns:
        - tx_hash, from_address, to_address
        - value (in Wei - string)
        - block_signed_at (ISO 8601)
        - successful (boolean)
        """
        try:
            return {
                "hash": raw_tx.get("tx_hash"),
                "from": raw_tx.get("from_address"),
                "to": raw_tx.get("to_address"),
                "value": self._wei_to_eth(raw_tx.get("value", "0")),
                "timestamp": self._parse_timestamp(raw_tx.get("block_signed_at")),
                "chain": "ethereum",
                "block_height": raw_tx.get("block_height"),
                "gas_used": raw_tx.get("gas_spent"),
                "gas_price": raw_tx.get("gas_price"),
                "status": "success" if raw_tx.get("successful") else "failed",
                "transaction_type": self._determine_eth_tx_type(raw_tx),
                "metadata": {
                    "nonce": raw_tx.get("nonce"),
                    "fees_paid": raw_tx.get("fees_paid"),
                }
            }
        except Exception as e:
            logger.error(f"Ethereum normalization failed: {e}")
            raise ValueError(f"Failed to normalize Ethereum transaction: {e}")
    
    def normalize_bitcoin_tx(self, raw_tx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize Bitcoin transactions (UTXO model)
        
        Bitcoin has different structure - inputs and outputs arrays
        """
        try:
            # Bitcoin uses UTXO - need to handle multiple inputs/outputs
            inputs = raw_tx.get("inputs", [])
            outputs = raw_tx.get("outputs", [])
            
            # Use first input/output for simplified model
            from_address = inputs[0].get("address") if inputs else None
            to_address = outputs[0].get("address") if outputs else None
            value_satoshi = raw_tx.get("value", 0)
            
            return {
                "hash": raw_tx.get("txid") or raw_tx.get("tx_hash"),
                "from": from_address,
                "to": to_address,
                "value": self._satoshi_to_btc(value_satoshi),
                "timestamp": raw_tx.get("block_time") or raw_tx.get("timestamp"),
                "chain": "bitcoin",
                "block_height": raw_tx.get("block_height"),
                "status": "success",  # Bitcoin only includes confirmed txs
                "transaction_type": "transfer",
                "metadata": {
                    "confirmations": raw_tx.get("confirmations"),
                    "fee": self._satoshi_to_btc(raw_tx.get("fee", 0)),
                    "input_count": len(inputs),
                    "output_count": len(outputs),
                }
            }
        except Exception as e:
            logger.error(f"Bitcoin normalization failed: {e}")
            raise ValueError(f"Failed to normalize Bitcoin transaction: {e}")
    
    def normalize_generic_tx(self, raw_tx: Dict[str, Any], chain: str) -> Dict[str, Any]:
        """
        Fallback normalizer for unsupported chains
        """
        return {
            "hash": raw_tx.get("hash") or raw_tx.get("tx_hash") or raw_tx.get("txid"),
            "from": raw_tx.get("from") or raw_tx.get("from_address"),
            "to": raw_tx.get("to") or raw_tx.get("to_address"),
            "value": float(raw_tx.get("value", 0)),
            "timestamp": raw_tx.get("timestamp") or raw_tx.get("block_time"),
            "chain": chain,
            "status": "success",
            "transaction_type": "transfer",
            "metadata": {}
        }
    
    # ===== Utility Methods =====
    
    def _wei_to_eth(self, wei_value: str) -> float:
        """Convert Wei to ETH (1 ETH = 10^18 Wei)"""
        if not wei_value:
            return 0.0
        try:
            return float(Decimal(wei_value) / Decimal(10**18))
        except:
            return 0.0
    
    def _satoshi_to_btc(self, satoshi_value: int) -> float:
        """Convert Satoshi to BTC (1 BTC = 10^8 Satoshi)"""
        if not satoshi_value:
            return 0.0
        try:
            return float(satoshi_value / 10**8)
        except:
            return 0.0
    
    def _parse_timestamp(self, timestamp_str: Any) -> int:
        """Convert various timestamp formats to Unix epoch"""
        if isinstance(timestamp_str, int):
            return timestamp_str
        if isinstance(timestamp_str, str):
            try:
                dt = parser.parse(timestamp_str)
                return int(dt.timestamp())
            except:
                return 0
        return 0
    
    def _determine_eth_tx_type(self, raw_tx: Dict[str, Any]) -> str:
        """Determine transaction type for Ethereum"""
        if raw_tx.get("to_address") is None:
            return "contract_creation"
        elif raw_tx.get("log_events"):
            return "contract_interaction"
        else:
            return "transfer"
```

**Test the Python server:**
```bash
cd python-server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app/main.py

# In another terminal, test:
curl http://localhost:8000/health
```

---

### **PHASE 5: Connect Node.js to Python** (1 hour)

Create: `backend/src/services/python.service.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

interface NormalizedTransaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  timestamp: number;
  chain: string;
  status: string;
}

export class PythonService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PYTHON_SERVER_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Send transactions to Python server for normalization
   */
  async normalizeTransactions(
    transactions: any[],
    chain: string
  ): Promise<NormalizedTransaction[]> {
    try {
      console.log(`[PythonService] Sending ${transactions.length} txs for normalization...`);
      
      const response = await this.client.post('/normalize', {
        transactions,
        chain,
      });
      
      console.log(`[PythonService] ✅ Normalized ${response.data.count} transactions`);
      return response.data.normalized;
      
    } catch (error) {
      console.error('[PythonService] Normalization failed:', error);
      throw new Error(`Python normalization failed: ${error}`);
    }
  }

  /**
   * Check if Python server is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  }
}
```

---

## ✅ Testing Your Work

### Test Backend Services
```bash
cd backend
npm test

# Or test manually
npm run dev
# Then use Postman/Thunder Client to test endpoints
```

### Test Python Server
```bash
cd python-server
pytest

# Or test manually
curl -X POST http://localhost:8000/normalize \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [...],
    "chain": "ethereum"
  }'
```

---

## 📊 Your Contribution Metrics

When done, you will have created:

| Component | Lines of Code | Impact |
|-----------|--------------|--------|
| `tatum.service.ts` | ~150 | High |
| `orchestrator.service.ts` | ~100 | Critical |
| `python.service.ts` | ~80 | High |
| `normalize.py` | ~400 | **CRITICAL** |
| Tests | ~300 | Medium |
| **TOTAL** | **~1,030** | **Very High** |

---

## 🎯 Timeline

- **Day 1**: Migrate code, setup monorepo (2 hours)
- **Day 2**: Build Tatum service (3 hours)
- **Day 3**: Build Orchestrator (2 hours)
- **Day 4-5**: Build Python normalization engine (6-8 hours)
- **Day 6**: Connect everything, test end-to-end (3 hours)
- **Day 7**: Documentation and polish (2 hours)

**Total**: ~18-20 hours of focused work

---

## 🆘 If You Get Stuck

1. Check the main `README.md`
2. Check `docs/CONTRIBUTION.md` for your responsibilities
3. Look at examples in this guide
4. Test each component independently before integration

---

## 🏆 Success Criteria

You're done when:
- ✅ All 3 services work independently (Tatum, Orchestrator, Python)
- ✅ Failover works (test by killing GoldRush API)
- ✅ Python normalizes Ethereum and Bitcoin correctly
- ✅ Node.js can send data to Python and get normalized results
- ✅ Tests are written and passing
- ✅ Code is documented

---

Good luck! This is the most critical integration work in the project. 💪
