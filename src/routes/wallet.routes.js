import express from "express";
import { registerWallet } from "../controllers/wallet.controller.js";

const router = express.Router();

// POST /api/wallet/register
router.post("/register", registerWallet);

export default router;