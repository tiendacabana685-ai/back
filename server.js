import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import fs from "fs";
import https from "https";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["https://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());

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
// HTTPS SERVER
// ===========================
try {
  const httpsOptions = {
    key: fs.readFileSync("./localhost-key.pem"),
    cert: fs.readFileSync("./localhost.pem"),
  };

  https.createServer(httpsOptions, app).listen(process.env.PORT, () => {
    console.log("====================================");
    console.log("🚀 BACKEND INICIADO");
    console.log(`✔ HTTPS: https://localhost:${process.env.PORT}`);
    console.log(`✔ Config: https://localhost:${process.env.PORT}/config`);
    console.log(`✔ Pagos: https://localhost:${process.env.PORT}/api/pagos/crear`);
    console.log("====================================");
  });
} catch (err) {
  console.error("❌ ERROR SSL:", err.message);
  console.log("Coloca los archivos localhost.pem y localhost-key.pem en backend/");
}
