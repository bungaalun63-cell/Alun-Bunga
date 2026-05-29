import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client using Node environmental API Key
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY not found in environment variables.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini:", error);
}

// API Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!ai });
});

// 1. AI Summarize Medical / Clinical Notes
app.post("/api/gemini/summarize", async (req: express.Request, res: express.Response) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API is not configured on the server." });
    }
    const { medicalNotes } = req.body;
    if (!medicalNotes) {
      return res.status(400).json({ error: "Catatan medis tidak boleh kosong." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Anda adalah asisten medis ahli kecerdasan buatan untuk sistem SIMRS. Ringkas catatan medis klinis yang berantakan berikut ke dalam format poin-poin medis profesional terstruktur yang berisi informasi kunci:\n1. Keluhan Utama & Gejala\n2. Diagnosis Kerja/Utama\n3. Terapi/Tindakan & Obat yang Diberikan\n4. Rencana Tindak Lanjut (Follow-up)\n\nHarap ditulis dalam Bahasa Indonesia yang formal dan tepat.\n\nCatatan Klinis:\n${medicalNotes}`,
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("Gemini raw summarize error:", error);
    res.status(500).json({ error: error.message || "Gagal memproses ringkasan medis oleh AI." });
  }
});

// 2. Translate Clinical Jargon to Layman Explanation
app.post("/api/gemini/translate-jargon", async (req: express.Request, res: express.Response) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API is not configured on the server." });
    }
    const { JargonText } = req.body;
    if (!JargonText) {
      return res.status(400).json({ error: "Istilah atau diagnosis tidak boleh kosong." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Sederhanakan dan jelaskan istilah atau diagnosis medis yang kompleks berikut agar dapat dipahami dengan mudah oleh pasien awam. Gunakan panggilan "Anda", nada bicara yang empatis, ramah, dan menenangkan. Berikan tip praktis hidup sehat yang relevan dengan kondisi tersebut.\n\nIstilah Medis:\n${JargonText}`,
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("Gemini jargon explanation error:", error);
    res.status(500).json({ error: error.message || "Gagal memproses penjelasan istilah medis oleh AI." });
  }
});

// 3. ICD-10 Search / Suggestion Helper
app.post("/api/gemini/icd10", async (req: express.Request, res: express.Response) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API is not configured on the server." });
    }
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query diagnosis tidak boleh kosong." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Berikan rekomendasi daftar kode ICD-10 (International Classification of Diseases, 10th Revision) yang paling relevan dengan deskripsi klinis singkat berdasarkan masukan gejala atau kondisi medis berikut.\nFormat keluaran berupa daftar markdown terstruktur dalam Bahasa Indonesia yang menjelaskan kode ICD-10, nama kategori penyakit, dan keterangan singkat.\n\nMasukan Kondisi:\n${query}`,
    });

    res.json({ suggestions: response.text });
  } catch (error: any) {
    console.error("Gemini ICD-10 suggestion error:", error);
    res.status(500).json({ error: error.message || "Gagal memperoleh rekomenasi ICD-10 dari AI." });
  }
});

// Bootstrapping Vite dev/production middleware
async function bootstrap() {
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
    console.log(`[SIMRS Backend] Running on port http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
