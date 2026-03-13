import axios from 'axios';
import { rateLimit } from '../utils/rateLimiter.js';

async function fetchGoldrushTxs(address, chain, cursor) {

  await rateLimit();

  const apiKey = process.env.GOLDRUSH_API_KEY;

  if (!apiKey) {
    throw new Error('GOLDRUSH_API_KEY is not set. Cannot fetch Goldrush transactions.');
  }

  const response = await axios.get(
    `https://api.goldrush.xyz/v1/${chain}/address/${address}/transactions`,
    {
      params: { cursor },
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    }
  );

  const data = response.data;

  return {
    transactions: data.items.map(tx => ({
      txHash: tx.tx_hash,
      blockNumber: tx.block_number,
      timestamp: new Date(tx.block_signed_at).getTime(),
      from: tx.from_address,
      to: tx.to_address,
      value: tx.value,
      assetType: 'NATIVE'
    })),
    nextCursor: data.pagination?.next_cursor
  };
}

export { fetchGoldrushTxs };