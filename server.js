// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Map translations to GitHub raw JSON
const TRANSLATION_URLS = {
  kjv: "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/kjv.json",
  web: "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/web.json",
  esv: "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/esv.json"
};

// In-memory cache
const cache = {};

// Fetch and cache JSON
async function getBibleData(translation) {
  if (!cache[translation]) {
    const res = await fetch(TRANSLATION_URLS[translation]);
    if (!res.ok) throw new Error("Failed to fetch Bible JSON");
    const data = await res.json();
    cache[translation] = data;
  }
  return cache[translation];
}

// Get verse by reference
app.get("/api/verse", async (req, res) => {
  const { book, chapter, verse, translation = "kjv" } = req.query;
  try {
    const data = await getBibleData(translation.toLowerCase());
    const result = data.find(v => 
      v.book.toLowerCase() === book.toLowerCase() &&
      v.chapter == chapter &&
      v.verse == verse
    );
    if (!result) return res.status(404).json({ error: "Verse not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search endpoint
app.get("/api/search", async (req, res) => {
  const { query, translation = "kjv" } = req.query;
  if (!query) return res.status(400).json({ error: "Query required" });
  try {
    const data = await getBibleData(translation.toLowerCase());
    const results = data.filter(v => v.text.toLowerCase().includes(query.toLowerCase()));
    res.json(results.slice(0, 100)); // limit to 100 for performance
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Bible API running on port ${PORT}`));
