const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/**
 * Placeholder manual notes store.
 * Подоцна ова ќе оди во база.
 */
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
  }
};

/**
 * Normalize names from GeoJSON / frontend.
 */
function normalizeCountryName(name) {
  const map = {
    "North Macedonia": "Macedonia",
    "Republic of Macedonia": "Macedonia",
    "United States of America": "United States",
    "Russian Federation": "Russia",
    "Syrian Arab Republic": "Syria",
    "Viet Nam": "Vietnam",
    "Korea, Republic of": "South Korea"
  };

  return map[name] || name;
}

/**
 * Wikipedia summary fetch.
 */
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
        headers: {
          "User-Agent": "globe-api/3.0"
        }
      });

      if (!res.ok) continue;

      const data = await res.json();

      if (data && data.extract) {
        return data.extract;
      }
    } catch (err) {
      console.error("Wikipedia fetch failed:", candidate, err.message);
    }
  }

  return `${country} is displayed in the globe platform. A fuller strategic overview will be added in the next backend iteration.`;
}

/**
 * Placeholder AI analysis.
 * Подоцна овде ќе дојде OpenAI.
 */
function buildRelationPlaceholders(country) {
  return {
    eu:
      `${country} has a relationship with the European Union that will be summarized here through live analytical generation. ` +
      `This section should eventually include institutional alignment, strategic positioning, accession or partnership dynamics, and recent political developments.`,

    usa:
      `${country} has a relationship with the United States that will be summarized here through live analytical generation. ` +
      `This section should later capture strategic cooperation, political tone, defense links, and current diplomatic trends.`,

    mk:
      `Relations between Macedonia and ${country} will be summarized here through live analytical generation. ` +
      `This section should later include bilateral dialogue, trade, regional context, and issues of diplomatic relevance.`
  };
}

/**
 * Placeholder headlines.
 * Подоцна ќе влечеме live news.
 */
function buildPlaceholderNews(country) {
  return [
    {
      title: `Top domestic headline for ${country} will appear here`,
      source: "Pending source"
    },
    {
      title: `Political or diplomatic update for ${country} will appear here`,
      source: "Pending source"
    },
    {
      title: `Economic or security development for ${country} will appear here`,
      source: "Pending source"
    }
  ];
}

function buildPlaceholderMediaAnalysis(country) {
  return (
    `Recent media coverage in ${country} will be summarized here in five concise sentences. ` +
    `This section is intended to reflect the dominant themes in the latest domestic headlines, translated into English where necessary, ` +
    `and synthesized into a short analytical brief for quick situational awareness.`
  );
}

/**
 * Build full country profile.
 */
async function buildCountryProfile(rawName) {
  const country = normalizeCountryName(rawName);
  const general = await fetchWikipediaSummary(country);
  const relations = buildRelationPlaceholders(country);
  const notes = manualNotes[country] || {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  };

  return {
    country,
    general,
    eu: relations.eu,
    usa: relations.usa,
    mk: relations.mk,
    news: buildPlaceholderNews(country),
    mediaAnalysis: buildPlaceholderMediaAnalysis(country),
    reminder: notes.reminder,
    talkingPoints: notes.talkingPoints,
    updatedAt: new Date().toISOString()
  };
}

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "globe-api",
    version: "3.0.0"
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

/**
 * Manual notes read.
 */
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

/**
 * Manual notes write.
 * Подоцна ќе го заклучиме со auth.
 */
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

app.listen(PORT, () => {
  console.log(`globe-api running on port ${PORT}`);
});
