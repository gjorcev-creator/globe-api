const express = require("express");
const cors = require("cors");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const CACHE_MINUTES = Number(process.env.ANALYSIS_CACHE_MINUTES || 20);

app.use(cors());
app.use(express.json());

/* =========================
   CACHE
========================= */

const cache = new Map();

function cacheKey(country) {
  return `country:${country.toLowerCase()}`;
}

function readCache(country) {
  const item = cache.get(cacheKey(country));
  if (!item) return null;

  const ttlMs = CACHE_MINUTES * 60 * 1000;
  if (Date.now() - item.createdAt > ttlMs) {
    cache.delete(cacheKey(country));
    return null;
  }

  return item.value;
}

function writeCache(country, value) {
  cache.set(cacheKey(country), {
    createdAt: Date.now(),
    value
  });
}

/* =========================
   MANUAL FIELDS
========================= */

const manualNotes = {
  Macedonia: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  France: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Germany: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  "United States": {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  "United Kingdom": {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Bulgaria: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Greece: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  }
};

/* =========================
   COUNTRY CONFIG
========================= */

const DEFAULT_MEDIA_DOMAINS = [
  "reuters.com",
  "apnews.com",
  "bbc.com",
  "theguardian.com",
  "dw.com",
  "nytimes.com",
  "foxnews.com",
  "euronews.com",
  "politico.eu",
  "ft.com"
];

const DEFAULT_OFFICIAL_DOMAINS = [
  "europa.eu",
  "eeas.europa.eu",
  "state.gov",
  "whitehouse.gov",
  "defense.gov",
  "nato.int",
  "un.org"
];

const countryConfig = {
  Macedonia: {
    keywords: [
      "Macedonia",
      "North Macedonia",
      "Skopje",
      "Mickoski",
      "Ohrid"
    ],
    mediaDomains: [
      "reuters.com",
      "apnews.com",
      "bbc.com",
      "dw.com",
      "euronews.com",
      "politico.eu",
      "nytimes.com"
    ],
    officialDomains: [
      "mfa.gov.mk",
      "vlada.mk",
      "sobranie.mk",
      "europa.eu",
      "eeas.europa.eu",
      "state.gov",
      "nato.int"
    ]
  },

  Germany: {
    keywords: [
      "Germany",
      "Berlin",
      "Scholz",
      "Bundeswehr",
      "Merz"
    ],
    mediaDomains: [
      "dw.com",
      "reuters.com",
      "bbc.com",
      "nytimes.com",
      "politico.eu",
      "ft.com",
      "theguardian.com"
    ],
    officialDomains: [
      "bundesregierung.de",
      "auswaertiges-amt.de",
      "bmvg.de",
      "europa.eu",
      "eeas.europa.eu",
      "state.gov",
      "nato.int"
    ]
  },

  France: {
    keywords: [
      "France",
      "Macron",
      "Paris",
      "French election",
      "Assemblée nationale"
    ],
    mediaDomains: [
      "reuters.com",
      "bbc.com",
      "nytimes.com",
      "theguardian.com",
      "politico.eu",
      "ft.com",
      "dw.com"
    ],
    officialDomains: [
      "elysee.fr",
      "diplomatie.gouv.fr",
      "gouvernement.fr",
      "europa.eu",
      "eeas.europa.eu",
      "state.gov",
      "nato.int"
    ]
  },

  "United Kingdom": {
    keywords: [
      "United Kingdom",
      "Britain",
      "UK",
      "Starmer",
      "King Charles",
      "duchess"
    ],
    mediaDomains: [
      "bbc.com",
      "theguardian.com",
      "reuters.com",
      "nytimes.com",
      "ft.com"
    ],
    officialDomains: [
      "gov.uk",
      "parliament.uk",
      "state.gov",
      "europa.eu",
      "nato.int"
    ]
  },

  "United States": {
    keywords: [
      "United States",
      "US",
      "Trump",
      "Melania",
      "Iran",
      "Pentagon",
      "Department of Defense",
      "Department of State"
    ],
    mediaDomains: [
      "nytimes.com",
      "foxnews.com",
      "reuters.com",
      "apnews.com",
      "bbc.com",
      "politico.com",
      "wsj.com"
    ],
    officialDomains: [
      "whitehouse.gov",
      "state.gov",
      "defense.gov",
      "congress.gov",
      "treasury.gov",
      "nato.int",
      "europa.eu"
    ]
  },

  Bulgaria: {
    keywords: [
      "Bulgaria",
      "Macedonia",
      "North Macedonia",
      "minority",
      "Action Plan",
      "EU",
      "Sofia"
    ],
    mediaDomains: [
      "reuters.com",
      "bbc.com",
      "politico.eu",
      "euronews.com",
      "dw.com",
      "nytimes.com"
    ],
    officialDomains: [
      "government.bg",
      "mfa.bg",
      "parliament.bg",
      "europa.eu",
      "eeas.europa.eu"
    ]
  },

  Greece: {
    keywords: [
      "Greece",
      "Macedonia",
      "North Macedonia",
      "Athens",
      "Mitsotakis"
    ],
    mediaDomains: [
      "reuters.com",
      "bbc.com",
      "politico.eu",
      "euronews.com",
      "dw.com",
      "nytimes.com"
    ],
    officialDomains: [
      "mfa.gr",
      "primeminister.gr",
      "government.gov.gr",
      "europa.eu",
      "eeas.europa.eu"
    ]
  }
};

function normalizeCountryName(name) {
  const map = {
    "North Macedonia": "Macedonia",
    "Republic of Macedonia": "Macedonia",
    "United States of America": "United States",
    "Russian Federation": "Russia",
    "Syrian Arab Republic": "Syria",
    "Viet Nam": "Vietnam",
    "Korea, Republic of": "South Korea",
    "Korea, Democratic People's Republic of": "North Korea",
    Czechia: "Czech Republic"
  };

  return map[name] || name;
}

function getCountryConfig(country) {
  const specific = countryConfig[country] || {};

  return {
    keywords: specific.keywords || [country],
    mediaDomains: specific.mediaDomains || DEFAULT_MEDIA_DOMAINS,
    officialDomains: specific.officialDomains || DEFAULT_OFFICIAL_DOMAINS
  };
}

/* =========================
   WIKIPEDIA
========================= */

async function fetchWikipediaSummary(country) {
  const candidates = [country];

  if (country === "Macedonia") {
    candidates.unshift("North Macedonia");
  }

  for (const candidate of candidates) {
    const url =
      "https://en.wikipedia.org/api/rest_v1/page/summary/" +
      encodeURIComponent(candidate);

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "globe-api/10.0.0" }
      });

      if (!res.ok) continue;

      const data = await res.json();
      if (data && data.extract) return data.extract;
    } catch (err) {
      console.error("Wikipedia fetch failed:", candidate, err.message);
    }
  }

  return `${country} is displayed in the globe platform. A fuller strategic overview will be added in the next iteration.`;
}

/* =========================
   OPENAI CORE
========================= */

async function openAIJson({ prompt, schema, domains = [] }) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing.");
  }

  const body = {
    model: OPENAI_MODEL,
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "country_profile_payload",
        strict: true,
        schema
      }
    }
  };

  if (domains.length) {
    body.tools = [
      {
        type: "web_search_preview",
        search_context_size: "medium"
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

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${errText}`);
  }

  const data = await res.json();

  const text = data.output_text;
  if (!text) {
    throw new Error("No output_text returned by OpenAI.");
  }

  return JSON.parse(text);
}

/* =========================
   WEB SEARCH PROMPTS
========================= */

function mediaPrompt(country, config) {
  return `
You are collecting real-time media inputs for a geopolitical dashboard.

Country: ${country}
Keywords: ${config.keywords.join(", ")}

Search the web and prioritize highly reputable media outlets relevant to the country.
Strongly prefer these media domains:
${config.mediaDomains.join(", ")}

Task:
1. Find 3 current and relevant articles for this country.
2. Prefer political, diplomatic, security, economic, election, or regional developments.
3. Avoid duplicates and pure opinion pieces if possible.
4. If a title is not in English, translate it to English.
5. For each item, include the article URL and source.
6. Return only structured JSON.
`;
}

function officialPrompt(country, config) {
  return `
You are collecting official-source inputs for a geopolitical dashboard.

Country: ${country}
Keywords: ${config.keywords.join(", ")}

Search the web and prioritize official domains relevant to this country.
Strongly prefer these official domains:
${config.officialDomains.join(", ")}

Task:
1. Find up to 5 recent official items relevant to this country.
2. Prioritize items useful for:
   - relations with the EU
   - relations with the USA
   - relations with Macedonia
3. Prefer foreign ministry, government, EU, NATO, and U.S. official statements.
4. Return only structured JSON.
`;
}

function synthesisPrompt(country, wikipediaSummary, mediaPacket, officialPacket) {
  return `
You are a geopolitical analyst preparing a concise operational country brief.

Country: ${country}

Stable background summary:
${wikipediaSummary}

Media packet:
${JSON.stringify(mediaPacket, null, 2)}

Official packet:
${JSON.stringify(officialPacket, null, 2)}

Instructions:
- Use the background summary only for stable context.
- Use current media plus official sources for recent developments.
- Cross-check where possible.
- If evidence is mixed or weak, say so clearly.
- Tone: diplomatic, analytical, concise, operational.
- The "mediaAnalysis" field must be exactly 5 sentences.
- Return only structured JSON.
`;
}

/* =========================
   JSON SCHEMAS
========================= */

const mediaSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    headlines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title_original: { type: "string" },
          title_english: { type: "string" },
          source: { type: "string" },
          url: { type: "string" },
          why_relevant: { type: "string" }
        },
        required: [
          "title_original",
          "title_english",
          "source",
          "url",
          "why_relevant"
        ]
      }
    },
    coverage_note: { type: "string" }
  },
  required: ["headlines", "coverage_note"]
};

const officialSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    official_updates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          source: { type: "string" },
          url: { type: "string" },
          relevance: { type: "string" }
        },
        required: ["title", "source", "url", "relevance"]
      }
    },
    official_note: { type: "string" }
  },
  required: ["official_updates", "official_note"]
};

const synthesisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    general: { type: "string" },
    eu: { type: "string" },
    usa: { type: "string" },
    mk: { type: "string" },
    mediaAnalysis: { type: "string" },
    confidenceNote: { type: "string" }
  },
  required: ["general", "eu", "usa", "mk", "mediaAnalysis", "confidenceNote"]
};

/* =========================
   LAYERS
========================= */

async function fetchMediaPacket(country, config) {
  try {
    return await openAIJson({
      prompt: mediaPrompt(country, config),
      schema: mediaSchema,
      domains: config.mediaDomains
    });
  } catch (err) {
    console.error("Media packet error:", err.message);
    return {
      headlines: [],
      coverage_note: "Media packet unavailable."
    };
  }
}

async function fetchOfficialPacket(country, config) {
  try {
    return await openAIJson({
      prompt: officialPrompt(country, config),
      schema: officialSchema,
      domains: config.officialDomains
    });
  } catch (err) {
    console.error("Official packet error:", err.message);
    return {
      official_updates: [],
      official_note: "Official packet unavailable."
    };
  }
}

async function synthesizeCountryProfile(country, wikipediaSummary, mediaPacket, officialPacket) {
  try {
    return await openAIJson({
      prompt: synthesisPrompt(country, wikipediaSummary, mediaPacket, officialPacket),
      schema: synthesisSchema
    });
  } catch (err) {
    console.error("Synthesis error:", err.message);
    return {
      general: wikipediaSummary,
      eu: "No EU analysis available.",
      usa: "No USA analysis available.",
      mk: "No Macedonia analysis available.",
      mediaAnalysis: "No media analysis available.",
      confidenceNote: "Cross-check confidence unavailable."
    };
  }
}

/* =========================
   PROFILE BUILDER
========================= */

async function buildCountryProfile(rawName) {
  const country = normalizeCountryName(rawName);

  const cached = readCache(country);
  if (cached) return cached;

  const config = getCountryConfig(country);
  const wikipediaSummary = await fetchWikipediaSummary(country);

  const notes = manualNotes[country] || {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  };

  const [mediaPacket, officialPacket] = await Promise.all([
    fetchMediaPacket(country, config),
    fetchOfficialPacket(country, config)
  ]);

  const synthesis = await synthesizeCountryProfile(
    country,
    wikipediaSummary,
    mediaPacket,
    officialPacket
  );

  const news = Array.isArray(mediaPacket.headlines)
    ? mediaPacket.headlines.slice(0, 3).map((item) => ({
        title: item.title_english || item.title_original || "Untitled",
        source: item.source || "",
        link: item.url || ""
      }))
    : [];

  const officialSources = Array.isArray(officialPacket.official_updates)
    ? officialPacket.official_updates.slice(0, 5)
    : [];

  const profile = {
    country,
    general: synthesis.general,
    eu: synthesis.eu,
    usa: synthesis.usa,
    mk: synthesis.mk,
    news,
    officialSources,
    mediaAnalysis: synthesis.mediaAnalysis,
    confidenceNote: synthesis.confidenceNote,
    reminder: notes.reminder,
    talkingPoints: notes.talkingPoints,
    updatedAt: new Date().toISOString()
  };

  writeCache(country, profile);
  return profile;
}

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "globe-api",
    version: "10.0.0"
  });
});

app.get("/country/:name", async (req, res) => {
  try {
    const rawName = decodeURIComponent(req.params.name);
    const profile = await buildCountryProfile(rawName);
    res.json(profile);
  } catch (err) {
    console.error("Country route error:", err);
    res.status(500).json({
      error: "Failed to build country profile."
    });
  }
});

app.get("/country/:name/notes", (req, res) => {
  const rawName = decodeURIComponent(req.params.name);
  const country = normalizeCountryName(rawName);

  const notes = manualNotes[country] || {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  };

  res.json({
    country,
    reminder: notes.reminder,
    talkingPoints: notes.talkingPoints
  });
});

app.post("/country/:name/notes", (req, res) => {
  const rawName = decodeURIComponent(req.params.name);
  const country = normalizeCountryName(rawName);

  const reminder =
    typeof req.body.reminder === "string"
      ? req.body.reminder
      : "Reserved for manual input.";

  const talkingPoints =
    typeof req.body.talkingPoints === "string"
      ? req.body.talkingPoints
      : "Reserved for manual input.";

  manualNotes[country] = {
    reminder,
    talkingPoints
  };

  res.json({
    ok: true,
    country,
    reminder,
    talkingPoints
  });
});

/* =========================
   START
========================= */

app.listen(PORT, () => {
  console.log(`globe-api running on port ${PORT}`);
});
