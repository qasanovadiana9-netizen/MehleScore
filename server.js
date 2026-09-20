const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20mb" }));

const DATA_FILE = path.join(__dirname, "data.json");

/* =========================
   DEFAULT DATA
========================= */

const DEFAULT_DATA = {
  leagues: [
    {
      id: "mehle-league",
      name: "Mehle League"
    }
  ],

  teams: [
    {
      id: "xirdalan-wolves",
      name: "Xirdalan Wolves",
      logo: "🐺",
      players: ["Ali", "Emin", "Raul", "Huseyin (2 blok)"]
    },
    {
      id: "msn-fk",
      name: "MSN FK",
      logo: "⚽",
      players: ["Fuad", "Murad", "Minə", "Şamxal"]
    },
    {
      id: "xirdalan-united",
      name: "Xirdalan United",
      logo: "🟢",
      players: ["Amil", "Elmir", "Huseyin", "İsa", "Ümüd"]
    },
    {
      id: "lotu-pisikler",
      name: "Lotu Pişiklər",
      logo: "🐱",
      players: ["Kamran", "Ayxan", "Ramil"]
    },
    {
      id: "neweli-fk",
      name: "Neweli FK",
      logo: "🔵",
      players: ["Tofik", "Arda", "Emil", "Vəli"]
    }
  ],

  players: [
    { id:"ali", name:"Ali", team:"Xirdalan Wolves", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"emin", name:"Emin", team:"Xirdalan Wolves", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"raul", name:"Raul", team:"Xirdalan Wolves", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"huseyin-2-blok", name:"Huseyin (2 blok)", team:"Xirdalan Wolves", goals:0, assists:0, saves:0, points:0, photo:"" },

    { id:"fuad", name:"Fuad", team:"MSN FK", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"murad", name:"Murad", team:"MSN FK", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"mine", name:"Minə", team:"MSN FK", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"samxal", name:"Şamxal", team:"MSN FK", goals:0, assists:0, saves:0, points:0, photo:"" },

    { id:"amil", name:"Amil", team:"Xirdalan United", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"elmir", name:"Elmir", team:"Xirdalan United", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"huseyin", name:"Huseyin", team:"Xirdalan United", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"isa", name:"İsa", team:"Xirdalan United", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"umud", name:"Ümüd", team:"Xirdalan United", goals:0, assists:0, saves:0, points:0, photo:"" },

    { id:"kamran", name:"Kamran", team:"Lotu Pişiklər", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"ayxan", name:"Ayxan", team:"Lotu Pişiklər", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"ramil", name:"Ramil", team:"Lotu Pişiklər", goals:0, assists:0, saves:0, points:0, photo:"" },

    { id:"tofik", name:"Tofik", team:"Neweli FK", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"arda", name:"Arda", team:"Neweli FK", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"emil", name:"Emil", team:"Neweli FK", goals:0, assists:0, saves:0, points:0, photo:"" },
    { id:"veli", name:"Vəli", team:"Neweli FK", goals:0, assists:0, saves:0, points:0, photo:"" }
  ],

  matches: [
    { id:1, home:"MSN FK", away:"Xirdalan United", homeScore:3, awayScore:0 },
    { id:2, home:"Lotu Pişiklər", away:"MSN FK", homeScore:4, awayScore:1 },
    { id:3, home:"Xirdalan Wolves", away:"Lotu Pişiklər", homeScore:5, awayScore:5 },
    { id:4, home:"Neweli FK", away:"MSN FK", homeScore:10, awayScore:8 },
    { id:5, home:"Xirdalan United", away:"Xirdalan Wolves", homeScore:3, awayScore:0 },
    { id:6, home:"Xirdalan United", away:"Lotu Pişiklər", homeScore:1, awayScore:0 },
    { id:7, home:"MSN FK", away:"Xirdalan Wolves", homeScore:9, awayScore:9 },
    { id:8, home:"Neweli FK", away:"Xirdalan United", homeScore:3, awayScore:5 }
  ]
};

/* =========================
   DATA
========================= */

let data = DEFAULT_DATA;

try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, "utf8").trim();

    if (raw) {
      data = JSON.parse(raw);
    }
  } else {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(DEFAULT_DATA, null, 2),
      "utf8"
    );
  }
} catch (error) {
  console.error("DATA ERROR:", error.message);
  data = DEFAULT_DATA;
}

function saveData() {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(data, null, 2),
      "utf8"
    );

    return true;
  } catch (error) {
    console.error("SAVE ERROR:", error.message);
    return false;
  }
}

/* =========================
   ADMIN SESSION
========================= */

const sessions = new Map();

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "AliScore2026";

function getCookies(req) {
  const header = req.headers.cookie || "";
  const cookies = {};

  header.split(";").forEach(part => {
    const index = part.indexOf("=");

    if (index === -1) return;

    const key = part.substring(0, index).trim();
    const value = part.substring(index + 1).trim();

    cookies[key] = decodeURIComponent(value);
  });

  return cookies;
}

function getSession(req) {
  const cookies = getCookies(req);
  const token = cookies.aliscore_session;

  if (!token) {
    return null;
  }

  const session = sessions.get(token);

  if (!session) {
    return null;
  }

  if (Date.now() > session.expires) {
    sessions.delete(token);
    return null;
  }

  return session;
}

function isAdmin(req) {
  return !!getSession(req);
}

function adminOnly(req, res, next) {
  if (!isAdmin(req)) {
    return res.status(401).json({
      error: "Admin girişi tələb olunur"
    });
  }

  next();
}

/* =========================
   API DATA
========================= */

app.get("/api/data", (req, res) => {
  res.json({
    data: data,
    isAdmin: isAdmin(req)
  });
});

app.get("/api/admin-status", (req, res) => {
  res.json({
    isAdmin: isAdmin(req)
  });
});

/* =========================
   LOGIN
========================= */

app.post("/api/login", (req, res) => {

  try {

    const password = String(
      req.body?.password || ""
    );

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        ok: false,
        error: "Yanlış şifrə"
      });
    }

    const token = crypto
      .randomBytes(32)
      .toString("hex");

    sessions.set(token, {
      expires: Date.now() + 24 * 60 * 60 * 1000
    });

    res.setHeader(
      "Set-Cookie",
      `aliscore_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    );

    return res.json({
      ok: true
    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Server xətası"
    });

  }

});

/* =========================
   LOGOUT
========================= */

app.post("/api/logout", (req, res) => {

  const cookies = getCookies(req);
  const token = cookies.aliscore_session;

  if (token) {
    sessions.delete(token);
  }

  res.setHeader(
    "Set-Cookie",
    "aliscore_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
  );

  res.json({
    ok: true
  });

});

/* =========================
   UPDATE ALL DATA
========================= */

app.put("/api/data", adminOnly, (req, res) => {

  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      error: "Yanlış məlumat"
    });
  }

  data = {
    leagues: Array.isArray(req.body.leagues)
      ? req.body.leagues
      : data.leagues,

    teams: Array.isArray(req.body.teams)
      ? req.body.teams
      : data.teams,

    players: Array.isArray(req.body.players)
      ? req.body.players
      : data.players,

    matches: Array.isArray(req.body.matches)
      ? req.body.matches
      : data.matches
  };

  if (!saveData()) {
    return res.status(500).json({
      error: "Məlumat yadda saxlanılmadı"
    });
  }

  res.json({
    ok: true,
    data
  });

});

/* =========================
   PLAYER
========================= */

app.put("/api/players/:id", adminOnly, (req, res) => {

  const id = String(req.params.id);

  const player = data.players.find(
    p => String(p.id) === id
  );

  if (!player) {
    return res.status(404).json({
      error: "Oyunçu tapılmadı"
    });
  }

  const body = req.body || {};

  if (body.goals !== undefined)
    player.goals = Number(body.goals) || 0;

  if (body.assists !== undefined)
    player.assists = Number(body.assists) || 0;

  if (body.saves !== undefined)
    player.saves = Number(body.saves) || 0;

  if (body.points !== undefined)
    player.points = Number(body.points) || 0;

  if (body.photo !== undefined)
    player.photo = String(body.photo || "");

  if (!saveData()) {
    return res.status(500).json({
      error: "Məlumat yadda saxlanılmadı"
    });
  }

  res.json({
    ok: true,
    player
  });

});

/* =========================
   ADD MATCH
========================= */

app.post("/api/matches", adminOnly, (req, res) => {

  const body = req.body || {};

  const home = String(body.home || "").trim();
  const away = String(body.away || "").trim();

  const homeScore = Number(body.homeScore);
  const awayScore = Number(body.awayScore);

  if (
    !home ||
    !away ||
    !Number.isFinite(homeScore) ||
    !Number.isFinite(awayScore)
  ) {
    return res.status(400).json({
      error: "Matç məlumatları düzgün deyil"
    });
  }

  const match = {
    id: Date.now(),
    home,
    away,
    homeScore,
    awayScore
  };

  data.matches.push(match);

  if (!saveData()) {
    return res.status(500).json({
      error: "Matç yadda saxlanılmadı"
    });
  }

  res.json({
    ok: true,
    match
  });

});

/* =========================
   DELETE MATCH
========================= */

app.delete("/api/matches/:id", adminOnly, (req, res) => {

  const id = String(req.params.id);

  const oldLength = data.matches.length;

  data.matches = data.matches.filter(
    match => String(match.id) !== id
  );

  if (data.matches.length === oldLength) {
    return res.status(404).json({
      error: "Matç tapılmadı"
    });
  }

  if (!saveData()) {
    return res.status(500).json({
      error: "Matç silinmədi"
    });
  }

  res.json({
    ok: true
  });

});

/* =========================
   STATIC WEBSITE
========================= */

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

app.get("*", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );

});

/* =========================
   START
========================= */

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `AliScore running on port ${PORT}`
  );

  console.log(
    `Admin password: ${
      process.env.ADMIN_PASSWORD
        ? "ENVIRONMENT VARIABLE"
        : "DEFAULT"
    }`
  );

});
