const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const app = express();
app.use(express.json());

// ABA sandbox credentials
const MERCHANT_ID = "ec462482";
const PUBLIC_KEY = "b9ef21fbe4bfcb64bfb28895452894efa2ac18a2";
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQCYznl5MoMhnD2xeKfU4Q0/1DjLBt2IdUm5KZmFQYNXsoLeP9Kf
ABVqGtYyId9OGbDLUVP2oWvWq7rk++3/+ddT/W/Q0U1uqs4dbxzGRQiMcZpLwxGu
7svsf+zhVxnqymxJAMY80dKYX6998i3MBEGvVCwOB7M8DgDyDSFVvctcrQIDAQAB
AoGAA+lJD7Kcy6fxplDFzvuhuLAIch3vXrZN2Ej5zoDiSUTe96xfikVYxvn/4JGg
YyHiNhoTUZ1JItoLcyAFtAcjnU8KTqDHT3P4sauHabK8asNBan75buu2JThtYvSR
Gi2hzlJ2L5oMXqygKtOUaFzI7odSj4YKFxcbxB/mrNHWeBsCQQDg+gCTcv8zYG2Q
lhq+VcZ/khBgFpPHsCXI6zKouKPM2+0M9m8Sap1OlOXTdO0w6dV/XqGVzqzOLaEZ
VreQrp/fAkEAreDEGKBVLMfbVBkQEng/jDce3Zy75ztgYU0DKCcFGrbmU7mDZE2y
uzWwf+XSgt+zVdGk0XwA1e/4kRWq1znk8wJAFbrP923yDEpSCtcUujGavJOlFULY
/z6aR6+/8t/yokTTvp7G16aIjyB+mk/+4OyU/HptbQTLWBa8KrBfho/3TQJAenEa
5dSR5jTeqDv162uuJEj0fU5Pq6dOWXZn0LCZkZRWYYLzmYB1aguGvKnUMcDhgn9c
tv/BfuW7fj9pzKHCLQJARxK5dwLuULChhHt+08NY+1aHiVqc1rZ89l1GRpgIXB5r
PZ/HRxSjp/dgfy3aRbhXa+Gce4QdKlGB3BbVfR9Jjw==
-----END RSA PRIVATE KEY-----`;

const API_URL =
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase";

// Sign payload with RSA private key
function signPayload(payload) {
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(JSON.stringify(payload));
  sign.end();
  return sign.sign(PRIVATE_KEY, "base64");
}

// POST /api/generate-qr
app.post("/generate-qr", async (req, res) => {
  const { amount, orderRef } = req.body;

  if (!amount || !orderRef) {
    return res.status(400).json({ error: "Amount and orderRef are required" });
  }

  try {
    const payload = {
      merchantId: MERCHANT_ID,
      amount,
      currency: "USD", // or KHR
      reference: orderRef,
    };

    const signature = signPayload(payload);

    const response = await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PUBLIC_KEY}`,
        "X-Signature": signature,
      },
    });

    const data = response.data;

    res.json({
      qrImage: data.qrImage,
      qrString: data.qrString,
      abapay_deeplink: data.abapay_deeplink,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
    });
  } catch (err) {
    console.error("ABA Sandbox error:", err.response?.data || err);
    res.status(500).json({ error: "Failed to generate ABA sandbox QR" });
  }
});

//tes
// app.post("/api/generate-qr", async (req, res) => {
//   const { amount, orderRef } = req.body;

//   try {
//     const payload = {
//       merchant_id: MERCHANT_ID,
//       order: {
//         id: orderRef,
//         amount: amount,
//         items: [{ name: "Cart Checkout", quantity: 1, price: amount }],
//       },
//       currency: "USD",
//       return_url: "https://example.com/success",
//       cancel_url: "https://example.com/cancel",
//     };

//     const response = await axios.post(API_URL, payload, {
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         Authorization: `Basic ${PUBLIC_KEY}`,
//       },
//     });

//     res.json({
//       status: "success",
//       qrImage: response.data.qr_image,
//       qrString: response.data.qr_string,
//     });
//   } catch (err) {
//     console.error("ABA Sandbox Error:", err.response?.data || err.message);
//     res.status(500).json({ error: "Failed to generate QR" });
//   }
// });

// app.listen(PORT, () => console.log(`ABA QR backend running on port ${PORT}`));
module.exports = router;
