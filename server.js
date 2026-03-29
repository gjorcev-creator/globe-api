const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const countryData = {
  France: {
    country: "France",
    general: "France is a major European power and a founding member of the EU.",
    eu: "Core EU member with strong influence over union policy.",
    usa: "Longstanding ally of the United States, with occasional strategic differences.",
    mk: "Stable and constructive bilateral relations with North Macedonia.",
    news: [
      { title: "France debates new European defense initiatives" },
      { title: "Paris hosts high-level diplomatic meetings" },
      { title: "French economy shows mixed signals" },
      { title: "France increases regional security engagement" },
      { title: "Energy policy remains central political issue" }
    ]
  },
  Germany: {
    country: "Germany",
    general: "Germany is Europe’s largest economy and a central EU actor.",
    eu: "Leading EU member shaping economic and political strategy.",
    usa: "Strong transatlantic partner with close security and trade ties.",
    mk: "Supportive partner of North Macedonia’s European path.",
    news: [
      { title: "Berlin reviews industrial competitiveness measures" },
      { title: "Germany pushes new EU policy coordination" },
      { title: "Coalition tensions shape domestic agenda" },
      { title: "German exports show gradual adjustment" },
      { title: "Debates continue on defense modernization" }
    ]
  },
  "North Macedonia": {
    country: "North Macedonia",
    general: "North Macedonia is a Balkan state and NATO member with an EU accession trajectory.",
    eu: "Candidate country focused on accession reforms and political alignment.",
    usa: "Strong strategic relationship with the United States through NATO and bilateral cooperation.",
    mk: "Domestic reference state.",
    news: [
      { title: "Government discusses reform priorities" },
      { title: "Regional diplomacy remains active" },
      { title: "EU-related legislation stays in focus" },
      { title: "Economic measures dominate public debate" },
      { title: "Security coordination continues with allies" }
    ]
  }
};

app.get("/", (req, res) => {
  res.json({ ok: true, service: "globe-api" });
});

app.get("/country/:name", (req, res) => {
  const rawName = req.params.name;
  const decodedName = decodeURIComponent(rawName);

  const data =
    countryData[decodedName] ||
    {
      country: decodedName,
      general: `${decodedName} is displayed in the globe platform.`,
      eu: `No structured EU assessment yet for ${decodedName}.`,
      usa: `No structured USA assessment yet for ${decodedName}.`,
      mk: `No structured North Macedonia assessment yet for ${decodedName}.`,
      news: [
        { title: `Top headlines for ${decodedName} will appear here` },
        { title: `Diplomatic update feed placeholder` },
        { title: `Economic developments placeholder` },
        { title: `Regional affairs placeholder` },
        { title: `Security developments placeholder` }
      ]
    };

  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`globe-api running on port ${PORT}`);
});
