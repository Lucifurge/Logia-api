// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Allow requests from anywhere

// Map translation keys to GitHub raw JSON URLs
const TRANSLATION_URLS = {
  kjv: "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/kjv.json",
  web: "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/web.json",
  esv: "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/esv.json"
};

// Endpoint: /bible?translation=kjv
app.get("/bible", async (req, res) => {
  const translation = (req.query.translation || "kjv").toLowerCase();

  if (!TRANSLATION_URLS[translation]) {
    return res.status(400).json({ error: "Translation not supported." });
  }

  try {
    const response = await fetch(TRANSLATION_URLS[translation]);
    if (!response.ok) throw new Error("Failed to fetch Bible data");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Bible data" });
  }
});

app.listen(PORT, () => {
  console.log(`Bible API running on port ${PORT}`);
});
