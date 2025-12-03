import express from "express";
import { crearIntentoPago } from "../controllers/pagosController.js";

const router = express.Router();

router.post("/create-payment-intent", crearIntentoPago);

export default router;
