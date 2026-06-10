import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

// Temporary memory store for dynamic verification codes: phone -> code
const otpStore = new Map<string, { code: string; timestamp: number }>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to dispatch dynamic code to phone
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ error: "Número de telefone é obrigatório." });
      }

      // Sanitize and format Brazilian phone numbers
      let sanitizedPhone = phone.replace(/\D/g, "");
      if (!sanitizedPhone) {
        return res.status(400).json({ error: "Número de telefone inválido." });
      }
      if (!sanitizedPhone.startsWith("55") && sanitizedPhone.length >= 10 && sanitizedPhone.length <= 11) {
        sanitizedPhone = "55" + sanitizedPhone;
      }
      if (!sanitizedPhone.startsWith("+")) {
        sanitizedPhone = "+" + sanitizedPhone;
      }

      // Generate a highly secure dynamic 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save it in the memory store (valid for 5 minutes)
      otpStore.set(sanitizedPhone, { code, timestamp: Date.now() });

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_FROM_NUMBER;

      const messageContent = `BINGO-AUTORAL: Ola Prof. Chico Dias! Seu codigo de seguranca para acessar o Painel do Professor eh: ${code}. NAO compartilhe.`;

      let sentRealSms = false;
      let errorDetails = "";

      if (accountSid && authToken && fromNumber) {
        try {
          const bodyParams = new URLSearchParams({
            To: sanitizedPhone,
            From: fromNumber,
            Body: messageContent,
          });

          const twilioResp = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            {
              method: "POST",
              headers: {
                "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: bodyParams.toString(),
            }
          );

          if (twilioResp.ok) {
            sentRealSms = true;
          } else {
            const errBody = await twilioResp.text();
            errorDetails = `API Twilio err ${twilioResp.status}: ${errBody}`;
            console.error("Falha ao enviar SMS pela API do Twilio:", errorDetails);
          }
        } catch (twilioErr: any) {
          errorDetails = twilioErr.message || String(twilioErr);
          console.error("Erro ao conectar com API Twilio:", twilioErr);
        }
      } else {
        errorDetails = "Configuracoes do Twilio ausentes no servidor.";
        console.warn("Variaveis TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN ou TWILIO_FROM_NUMBER nao preenchidas.");
      }

      // We succeed generation so that the local simulator can show the code in dev if Twilio is not pre-configured
      return res.json({
        success: true,
        sentRealSms,
        formattedPhone: sanitizedPhone,
        code: (!sentRealSms) ? code : undefined, // expose code to emulator ONLY if we couldn't dispatch it via real carrier SMS
        errorDetails: !sentRealSms ? errorDetails : undefined,
      });

    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: e.message || "Erro interno ao processar SMS." });
    }
  });

  // API Route to verify the SMS otp code
  app.post("/api/verify-otp", (req, res) => {
    try {
      const { phone, code } = req.body;
      if (!phone || !code) {
        return res.status(400).json({ error: "Faltando telefone ou codigo de verificacao." });
      }

      let sanitizedPhone = phone.replace(/\D/g, "");
      if (!sanitizedPhone.startsWith("55") && sanitizedPhone.length >= 10 && sanitizedPhone.length <= 11) {
        sanitizedPhone = "55" + sanitizedPhone;
      }
      if (!sanitizedPhone.startsWith("+")) {
        sanitizedPhone = "+" + sanitizedPhone;
      }

      const match = otpStore.get(sanitizedPhone);
      if (!match) {
        return res.status(400).json({ error: "Nenhum codigo foi enviado para este celular ou ja expirou." });
      }

      // Check lifetime (5 minutes check)
      const age = Date.now() - match.timestamp;
      if (age > 5 * 60 * 1000) {
        otpStore.delete(sanitizedPhone);
        return res.status(400).json({ error: "O codigo de verificacao expirou (max 5 min). Solicite outro." });
      }

      if (match.code === code.trim()) {
        otpStore.delete(sanitizedPhone); // consume
        return res.json({ success: true });
      } else {
        return res.status(400).json({ error: "Codigo invalido! Tente novamente." });
      }

    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Erro interno na verificacao do token." });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bingo full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
