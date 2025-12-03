import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();

// ===========================
// CORS CONFIG
// ===========================
app.use(
  cors({
    origin: [
      "https://tiendacabana685-ai.github.io",
      "https://tiendacabana685-ai.github.io/front"
    ],
    credentials: true,
  })
);

app.use(express.json());

// ===========================
// STRIPE INIT
// ===========================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===========================
// CONFIG ENDPOINT
// ===========================
app.get("/config", (req, res) => {
  res.json({
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
  });
});

// ===========================
// CREAR PAYMENT INTENT
// ===========================
app.post("/api/pagos/crear", async (req, res) => {
  try {
    const { monto, moneda, descripcion } = req.body;

    if (!monto || monto < 50) {
      return res
        .status(400)
        .json({ error: "El monto debe ser al menos 50 centavos" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: monto,
      currency: moneda || "mxn",
      description: descripcion || "Compra en tienda",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      idTransaccion: paymentIntent.id,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================
// HTTP SERVER (Render)
// ===========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("====================================");
  console.log("🚀 BACKEND INICIADO");
  console.log(`✔ HTTP: http://localhost:${PORT}`);
  console.log(`✔ Config: http://localhost:${PORT}/config`);
  console.log(`✔ Pagos: http://localhost:${PORT}/api/pagos/crear`);
  console.log("====================================");
});
