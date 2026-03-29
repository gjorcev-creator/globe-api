const express = require("express");
const cors = require("cors");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-4.1-mini";

app.use(cors());
app.use(express.json());

/* =========================
   CACHE
========================= */

const cache = new Map();
const CACHE_TTL = 20 * 60 * 1000; // 20 мин

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() - item.time > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

function setCache(key, data) {
  cache.set(key, {
    time: Date.now(),
    data
  });
}

/* =========================
   COUNTRY CONFIG
========================= */

const countryConfig = {
  France: {
    keywords: ["France", "Macron", "Paris", "EU"],
  },
  Germany: {
    keywords: ["Germany", "Berlin", "Scholz", "Bundeswehr"],
  },
  Macedonia: {
    keywords: ["Macedonia", "North Macedonia", "Skopje"],
  },
  "United States": {
    keywords: ["United States", "US", "Trump", "Pentagon", "Iran"],
  },
  "United Kingdom": {
    keywords: ["UK", "Britain", "King", "Starmer"],
  }
};

/* =========================
   WIKIPEDIA
========================= */

async function getWiki(country) {
  try {
    const url =
      "https://en.wikipedia.org/api/rest_v1/page/summary/" +
      encodeURIComponent(country);

    const res = await fetch(url);
    const data = await res.json();

    return data.extract || "No data available.";
  } catch {
    return "No data available.";
  }
}

/* =========================
   OPENAI CALL
========================= */

async function callAI(prompt, domains = []) {
  const body = {
    model: MODEL,
    input: prompt
  };

  if (domains.length) {
    body.tools = [
      {
        type: "web_search",
        filters: { allowed_domains: domains }
      }
    ];
  }

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!data.output) return "";

  return data.output
    .map(o => o.content?.map(c => c.text).join(""))
    .join("");
}

/* =========================
   MEDIA LAYER
========================= */

async function getMedia(country, keywords) {
  const prompt = `
Find 3 latest geopolitical news about ${country}.
Keywords: ${keywords.join(", ")}

Return JSON:
{
 "news":[
  { "title":"", "source":"", "link":"" }
 ]
}
`;

  const text = await callAI(prompt, [
    "reuters.com",
    "bbc.com",
    "nytimes.com",
    "dw.com",
    "theguardian.com"
  ]);

  try {
    return JSON.parse(text);
  } catch {
    return { news: [] };
  }
}

/* =========================
   OFFICIAL LAYER
========================= */

async function getOfficial(country) {
  const prompt = `
Find official government or EU/US/NATO statements about ${country}.

Return JSON:
{
 "official":[
  { "title":"", "source":"", "link":"" }
 ]
}
`;

  const text = await callAI(prompt, [
    "europa.eu",
    "state.gov",
    "nato.int",
    "gov.uk",
    "whitehouse.gov"
  ]);

  try {
    return JSON.parse(text);
  } catch {
    return { official: [] };
  }
}

/* =========================
   ANALYSIS
========================= */

async function getAnalysis(country, wiki, media, official) {
  const prompt = `
You are a geopolitical analyst.

Country: ${country}

Background:
${wiki}

News:
${JSON.stringify(media)}

Official:
${JSON.stringify(official)}

Write JSON:

{
 "general":"",
 "eu":"",
 "usa":"",
 "mk":"",
 "mediaAnalysis":""
}

Rules:
- 5 sentences each
- analytical
- concise
`;

  const text = await callAI(prompt);

  try {
    return JSON.parse(text);
  } catch {
    return {
      general: wiki,
      eu: "No data",
      usa: "No data",
      mk: "No data",
      mediaAnalysis: "No data"
    };
  }
}

/* =========================
   MAIN BUILDER
========================= */

async function build(country) {
  const cached = getCache(country);
  if (cached) return cached;

  const config = countryConfig[country] || { keywords: [country] };

  const wiki = await getWiki(country);

  const [media, official] = await Promise.all([
    getMedia(country, config.keywords),
    getOfficial(country)
  ]);

  const analysis = await getAnalysis(
    country,
    wiki,
    media,
    official
  );

  const result = {
    country,
    general: analysis.general,
    eu: analysis.eu,
    usa: analysis.usa,
    mk: analysis.mk,
    news: media.news || [],
    official: official.official || [],
    mediaAnalysis: analysis.mediaAnalysis,
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input.",
    updatedAt: new Date().toISOString()
  };

  setCache(country, result);

  return result;
}

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {
  res.json({ ok: true, version: "FINAL AI" });
});

app.get("/country/:name", async (req, res) => {
  const country = decodeURIComponent(req.params.name);
  const data = await build(country);
  res.json(data);
});

/* =========================
   START
========================= */

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
