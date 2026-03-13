import Wallet from '../models/wallet.model.js';
import { startHistoricalSync } from '../services/ledger.service.js';

export async function registerWallet(req, res) {
    try {
        const { address, chain } = req.body;

        if (!address || !chain) {
            return res.status(400).json({
                message: 'Address and chain are required'
            });
        }

        let wallet = await Wallet.findOne({ address, chain });

        if (!wallet) {
            wallet = await Wallet.create({
                address,
                chain,
                syncStatus: 'PENDING'
            });
        }

        // Trigger historical sync (async background job)
        startHistoricalSync(wallet);

        return res.json({
            message: 'Wallet registered. Sync started.',
            walletId: wallet._id
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}