const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "globe-api/6.0.0" }
});

app.use(cors());
app.use(express.json());

/* =========================
   FEEDS
========================= */

const FEEDS = {
  BBC_WORLD: "https://feeds.bbci.co.uk/news/world/rss.xml",
  BBC_EUROPE: "https://feeds.bbci.co.uk/news/world/europe/rss.xml",
  BBC_US: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
  BBC_UK: "https://feeds.bbci.co.uk/news/uk/rss.xml",
  BBC_ASIA: "https://feeds.bbci.co.uk/news/world/asia/rss.xml",
  BBC_MIDDLE_EAST: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",

  NYT_WORLD: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  NYT_HOME: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",

  FOX_US: "https://moxie.foxnews.com/google-publisher/latest.xml",

  GUARDIAN_WORLD: "https://www.theguardian.com/world/rss",

  DW: "https://rss.dw.com/rdf/rss-en-all"
};

/* =========================
   RSS SOURCES
========================= */

const rssSources = {
  Macedonia: [FEEDS.BBC_EUROPE, FEEDS.DW],

  Germany: [FEEDS.DW, FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  France: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD, FEEDS.GUARDIAN_WORLD],
  Italy: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Spain: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],

  "United Kingdom": [FEEDS.BBC_UK, FEEDS.GUARDIAN_WORLD],
  Ireland: [FEEDS.BBC_UK, FEEDS.GUARDIAN_WORLD],

  "United States": [FEEDS.NYT_HOME, FEEDS.FOX_US, FEEDS.BBC_US],

  Russia: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD, FEEDS.DW],
  Ukraine: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],

  China: [FEEDS.BBC_ASIA, FEEDS.NYT_WORLD, FEEDS.DW],
  Japan: [FEEDS.BBC_ASIA, FEEDS.NYT_WORLD],
  India: [FEEDS.BBC_ASIA, FEEDS.NYT_WORLD],

  Turkey: [FEEDS.BBC_MIDDLE_EAST, FEEDS.DW],
  Iran: [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],
  Israel: [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],
  Egypt: [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],

  Greece: [FEEDS.BBC_EUROPE],
  Bulgaria: [FEEDS.BBC_EUROPE],
  Serbia: [FEEDS.BBC_EUROPE],
  Albania: [FEEDS.BBC_EUROPE],
  Kosovo: [FEEDS.BBC_EUROPE],

  Brazil: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  Argentina: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],

  Australia: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  Canada: [FEEDS.BBC_US, FEEDS.NYT_WORLD]
};

/* =========================
   HELPERS
========================= */

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

/* =========================
   RSS FETCH
========================= */

async function fetchRssNews(country) {
  const feeds = rssSources[country];

  if (!feeds) {
    return [
      { title: "No RSS available", source: "", link: "" }
    ];
  }

  const results = [];
  const seen = new Set();

  const countryLower = country.toLowerCase();

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);

      let addedFromThisFeed = false;

      for (const item of feed.items || []) {
        if (!item.title) continue;

        const titleLower = item.title.toLowerCase();

        // 🔥 ФИЛТЕР ПО ДРЖАВА
        if (!titleLower.includes(countryLower)) continue;

        if (seen.has(item.title)) continue;

        seen.add(item.title);

        results.push({
          title: item.title,
          source: feed.title,
          link: item.link
        });

        addedFromThisFeed = true;
        break; // ✅ зема само 1 по извор
      }

      // 🔥 FALLBACK ако нема match
      if (!addedFromThisFeed && feed.items.length > 0) {
        const fallbackItem = feed.items[0];

        if (!seen.has(fallbackItem.title)) {
          seen.add(fallbackItem.title);

          results.push({
            title: fallbackItem.title,
            source: feed.title,
            link: fallbackItem.link
          });
        }
      }

    } catch (err) {
      console.log("RSS error:", err.message);
    }
  }

  // максимум 3 вести
  return results.slice(0, 3);
}

/* =========================
   MAIN BUILDER
========================= */

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

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {
  res.json({ ok: true, version: "6.0.0" });
});

app.get("/country/:name", async (req, res) => {
  const data = await buildCountryProfile(req.params.name);
  res.json(data);
});

/* =========================
   START
========================= */

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
