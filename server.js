const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;
const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "globe-api/5.1.0"
  }
});

app.use(cors());
app.use(express.json());

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
  Greece: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Bulgaria: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Serbia: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Albania: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Kosovo: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Italy: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Spain: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  "United Kingdom": {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Russia: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Ukraine: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  China: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Iran: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Turkey: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  },
  Israel: {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  }
};

const FEEDS = {
  BBC_WORLD: "https://feeds.bbci.co.uk/news/world/rss.xml",
  BBC_EUROPE: "https://feeds.bbci.co.uk/news/world/europe/rss.xml",
  BBC_MIDDLE_EAST: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
  BBC_US_CANADA: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
  BBC_ASIA: "https://feeds.bbci.co.uk/news/world/asia/rss.xml",
  BBC_UK: "https://feeds.bbci.co.uk/news/uk/rss.xml",
  NYT_WORLD: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  NYT_EUROPE: "https://rss.nytimes.com/services/xml/rss/nyt/Europe.xml",
  NYT_HOMEPAGE: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
};

const rssSources = {
  Macedonia: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Albania: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Kosovo: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Serbia: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Bulgaria: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Greece: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Romania: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Croatia: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Slovenia: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Montenegro: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  "Bosnia and Herzegovina": [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Hungary: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Austria: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Switzerland: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Czech Republic: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Slovakia: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Poland: [FEEDS.BBC_EUROPE, FEEDS.NYT_EUROPE],
  Germany: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  France: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Italy: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Spain: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Portugal: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Netherlands: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Belgium: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Luxembourg: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Ireland: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Denmark: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Sweden: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Norway: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Finland: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Estonia: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Latvia: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Lithuania: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Ukraine: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  Russia: [FEEDS.BBC_EUROPE, FEEDS.NYT_WORLD],
  "United Kingdom": [FEEDS.BBC_UK, FEEDS.NYT_WORLD],
  "United States": [FEEDS.BBC_US_CANADA, FEEDS.NYT_HOMEPAGE],
  Canada: [FEEDS.BBC_US_CANADA, FEEDS.NYT_WORLD],
  Mexico: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  Turkey: [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],
  Israel: [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],
  Palestine: [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],
  Lebanon: [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],
  Syria: [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],
  Jordan: [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],
  Iraq: [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],
  Iran: [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],
  "Saudi Arabia": [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],
  Egypt: [FEEDS.BBC_MIDDLE_EAST, FEEDS.NYT_WORLD],
  China: [FEEDS.BBC_ASIA, FEEDS.NYT_WORLD],
  Japan: [FEEDS.BBC_ASIA, FEEDS.NYT_WORLD],
  India: [FEEDS.BBC_ASIA, FEEDS.NYT_WORLD],
  Pakistan: [FEEDS.BBC_ASIA, FEEDS.NYT_WORLD],
  "South Korea": [FEEDS.BBC_ASIA, FEEDS.NYT_WORLD],
  Vietnam: [FEEDS.BBC_ASIA, FEEDS.NYT_WORLD],
  Thailand: [FEEDS.BBC_ASIA, FEEDS.NYT_WORLD],
  Indonesia: [FEEDS.BBC_ASIA, FEEDS.NYT_WORLD],
  Australia: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  "New Zealand": [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  Brazil: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  Argentina: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  Chile: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  Colombia: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  "South Africa": [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  Nigeria: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  Ethiopia: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  Morocco: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  Algeria: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD],
  Tunisia: [FEEDS.BBC_WORLD, FEEDS.NYT_WORLD]
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
    Czechia: "Czech Republic",
    "Bosnia and Herz.": "Bosnia and Herzegovina"
  };

  return map[name] || name;
}

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
          "User-Agent": "globe-api/5.1.0"
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

  return `${country} is displayed in the globe platform. A fuller strategic overview will be added in a later backend iteration.`;
}

function buildEuSummary(country) {
  if (country === "Macedonia") {
    return "Macedonia maintains a strategically important relationship with the European Union centered on accession, reform, and political alignment. The EU remains the main external institutional reference point for the country, and developments in Brussels directly shape its domestic political agenda. The relationship is generally constructive, but progress is often tied to internal reforms, regional diplomacy, and broader enlargement dynamics.";
  }

  if (
    country === "France" ||
    country === "Germany" ||
    country === "Italy" ||
    country === "Spain"
  ) {
    return `${country} is a major European actor with an institutional relationship to the European Union that is central rather than external. Its domestic politics, economic agenda, and foreign policy priorities are deeply tied to EU-level decision making. In practical terms, this means that its role inside the Union is a core part of its wider geopolitical position.`;
  }

  if (
    country === "United States" ||
    country === "China" ||
    country === "Russia"
  ) {
    return `${country} is not part of the European Union, but its relationship with the EU is strategically important and shaped by trade, security, diplomacy, and regulatory friction. The tone of the relationship depends on the wider international climate, sanctions policy, and alignment on major crises.`;
  }

  return `${country} has a politically relevant relationship with the European Union that should be understood through diplomacy, trade, regulatory alignment, and wider regional context. Depending on the country, that relationship may be shaped by accession ambitions, partnership frameworks, or strategic competition.`;
}

function buildUsaSummary(country) {
  if (country === "Macedonia") {
    return "Macedonia has a stable strategic relationship with the United States, particularly through NATO cooperation, political support, and regional security alignment. Washington is seen as an important external partner in defense, institutional stability, and regional diplomacy. The relationship is generally positive and anchored in long-term strategic support.";
  }

  if (
    country === "France" ||
    country === "Germany" ||
    country === "United Kingdom"
  ) {
    return `${country} has a deep but sometimes nuanced relationship with the United States, shaped by alliance politics, security cooperation, and broader transatlantic coordination. Even when tactical disagreements appear, the overall relationship remains strategically important. Defense, diplomacy, and crisis response are usually the key pillars.`;
  }

  if (
    country === "Russia" ||
    country === "Iran" ||
    country === "China"
  ) {
    return `${country} has a strategically sensitive and often competitive relationship with the United States. The relationship is usually defined by security questions, sanctions, broader geopolitical rivalry, and crisis-driven diplomacy.`;
  }

  return `${country} has a relationship with the United States that should be understood through strategic cooperation, political dialogue, economic ties, and security context. The overall tone can vary by region and by current events.`;
}

function buildMacedoniaSummary(country) {
  if (country === "Macedonia") {
    return "This is the domestic reference entry for Macedonia. In later iterations, this field can be used either as a self-profile note or replaced by a domestic strategic assessment relevant to the workflow.";
  }

  if (
    country === "France" ||
    country === "Germany" ||
    country === "Italy"
  ) {
    return `Relations between Macedonia and ${country} are generally framed through European integration, bilateral diplomacy, and political support in wider European processes. Depending on the country, the relationship may also include economic cooperation, cultural presence, and institutional dialogue.`;
  }

  if (country === "United States") {
    return "Relations between Macedonia and the United States are strategically important and generally positive. They are shaped by NATO membership, security cooperation, political support, and wider regional stability considerations. This is one of the most important bilateral external relationships for Macedonia.";
  }

  if (
    country === "Greece" ||
    country === "Bulgaria" ||
    country === "Albania" ||
    country === "Serbia" ||
    country === "Kosovo"
  ) {
    return `Relations between Macedonia and ${country} are regionally significant and should be understood in the context of neighborhood politics, trade, infrastructure, minority issues where relevant, and broader Balkan stability. These ties often carry more immediate political sensitivity than more distant bilateral relationships.`;
  }

  return `Relations between Macedonia and ${country} should be understood through bilateral dialogue, regional context, economic contact, and current diplomatic priorities. The significance of the relationship depends on geography, institutional alignment, and current political developments.`;
}

function buildFallbackNews(country) {
  return [
    {
      title: `Top domestic headline for ${country} will appear here`,
      source: "Pending source",
      link: ""
    },
    {
      title: `Political or diplomatic update for ${country} will appear here`,
      source: "Pending source",
      link: ""
    },
    {
      title: `Economic or security development for ${country} will appear here`,
      source: "Pending source",
      link: ""
    }
  ];
}

function buildMediaAnalysis(country, newsItems) {
  if (!newsItems || !newsItems.length) {
    return `Current media coverage in ${country} is not yet connected to a live source feed in this backend version. This section serves as a placeholder for a short analytical readout of the dominant themes in leading domestic headlines.`;
  }

  const headlineList = newsItems.map((n) => n.title).join(" | ");

  return `Recent headline coverage relevant to ${country} is now being pulled through RSS feeds. At this stage, the backend is displaying titles only, without translation or full-text synthesis. The visible themes can already give a quick first signal of political, diplomatic, economic, or security developments. In the next iteration, these headlines should be translated where needed and converted into a concise five-sentence analytical brief. Current headlines: ${headlineList}`;
}

async function fetchRssNews(country) {
  const feeds = rssSources[country];

  if (!feeds || !feeds.length) {
    return buildFallbackNews(country);
  }

  const collected = [];
  const seenTitles = new Set();

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items || []) {
        if (!item.title) continue;
        if (seenTitles.has(item.title)) continue;

        seenTitles.add(item.title);

        collected.push({
          title: item.title,
          source: feed.title || feedUrl,
          link: item.link || ""
        });

        if (collected.length >= 8) break;
      }
    } catch (err) {
      console.error("RSS fetch failed:", country, feedUrl, err.message);
    }

    if (collected.length >= 8) break;
  }

  if (!collected.length) {
    return buildFallbackNews(country);
  }

  return collected.slice(0, 3);
}

async function buildCountryProfile(rawName) {
  const country = normalizeCountryName(rawName);
  const general = await fetchWikipediaSummary(country);
  const news = await fetchRssNews(country);

  const notes = manualNotes[country] || {
    reminder: "Reserved for manual input.",
    talkingPoints: "Reserved for manual input."
  };

  return {
    country,
    general,
    eu: buildEuSummary(country),
    usa: buildUsaSummary(country),
    mk: buildMacedoniaSummary(country),
    news,
    mediaAnalysis: buildMediaAnalysis(country, news),
    reminder: notes.reminder,
    talkingPoints: notes.talkingPoints,
    updatedAt: new Date().toISOString()
  };
}

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "globe-api",
    version: "5.1.0"
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

app.listen(PORT, () => {
  console.log(`globe-api running on port ${PORT}`);
});
