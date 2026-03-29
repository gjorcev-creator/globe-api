const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "globe-api/5.1.1" }
});

app.use(cors());
app.use(express.json());

const rssSources = {
  Macedonia: ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"],
  France: ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"],
  Germany: ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"],
  Italy: ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"],
  Spain: ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"],
  Greece: ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"],
  Bulgaria: ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"],
  Serbia: ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"],
  Albania: ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"],
  Russia: ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"],
  Ukraine: ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"],
  China: ["https://feeds.bbci.co.uk/news/world/asia/rss.xml"],
  Iran: ["https://feeds.bbci.co.uk/news/world/middle_east/rss.xml"],
  Turkey: ["https://feeds.bbci.co.uk/news/world/middle_east/rss.xml"],

  "United States": ["https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"],
  "United Kingdom": ["https://feeds.bbci.co.uk/news/uk/rss.xml"],
  "Czech Republic": ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"],
  "South Korea": ["https://feeds.bbci.co.uk/news/world/asia/rss.xml"],
  "Bosnia and Herzegovina": ["https://feeds.bbci.co.uk/news/world/europe/rss.xml"]
};

function normalizeCountryName(name) {
  const map = {
    "North Macedonia": "Macedonia",
    "United States of America": "United States",
    Czechia: "Czech Republic"
  };

  return map[name] || name;
}

async function fetchWikipediaSummary(country) {
  const url =
    "https://en.wikipedia.org/api/rest_v1/page/summary/" +
    encodeURIComponent(country);

  try {
    const res = await fetch(url);
    const data = await res.json();

    return data.extract || "No summary available.";
  } catch {
    return "No summary available.";
  }
}

async function fetchRssNews(country) {
  const feeds = rssSources[country];

  if (!feeds) {
    return [
      { title: "No RSS available", source: "", link: "" }
    ];
  }

  const results = [];

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items || []) {
        results.push({
          title: item.title,
          source: feed.title,
          link: item.link
        });

        if (results.length >= 3) break;
      }
    } catch (err) {
      console.log("RSS error:", err.message);
    }
  }

  return results.slice(0, 3);
}

async function buildCountryProfile(rawName) {
  const country = normalizeCountryName(rawName);

  const general = await fetchWikipediaSummary(country);
  const news = await fetchRssNews(country);

  return {
    country,
    general,
    eu: "EU analysis placeholder",
    usa: "USA analysis placeholder",
    mk: "Macedonia relations placeholder",
    news,
    mediaAnalysis: "Media analysis placeholder",
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input.",
    updatedAt: new Date().toISOString()
  };
}

app.get("/", (req, res) => {
  res.json({ ok: true, version: "5.1.1" });
});

app.get("/country/:name", async (req, res) => {
  const data = await buildCountryProfile(req.params.name);
  res.json(data);
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
