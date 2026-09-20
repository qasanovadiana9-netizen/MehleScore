const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const DATA_FILE = path.join(__dirname, "data.json");

let data;

try {
  data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
} catch {
  data = {
    leagues: [],
    teams: [],
    players: [],
    matches: []
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const sessions = new Map();

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getCookie(req, name) {
  const cookies = req.headers.cookie || "";

  const match = cookies
    .split(";")
    .map(x => x.trim())
    .find(x => x.startsWith(name + "="));

  return match
    ? decodeURIComponent(match.substring(name.length + 1))
    : null;
}

function isAdmin(req) {
  const token = getCookie(req, "aliscore_session");

  if (!token) return false;

  const session = sessions.get(token);

  if (!session) return false;

  if (Date.now() > session.expires) {
    sessions.delete(token);
    return false;
  }

  return true;
}

function adminOnly(req, res, next) {
  if (!isAdmin(req)) {
    return res.status(401).json({
      error: "Admin girişi tələb olunur"
    });
  }

  next();
}

app.get("/api/data", (req, res) => {
  res.json({
    data,
    isAdmin: isAdmin(req)
  });
});

app.post("/api/login", (req, res) => {
  const password = String(req.body.password || "");

  const adminPassword =
    process.env.ADMIN_PASSWORD || "AliScore2026";

  if (password !== adminPassword) {
    return res.status(401).json({
      error: "Yanlış şifrə"
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  sessions.set(token, {
    expires: Date.now() + 24 * 60 * 60 * 1000
  });

  res.setHeader(
    "Set-Cookie",
    `aliscore_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`
  );

  res.json({ ok: true });
});

app.post("/api/logout", (req, res) => {
  const token = getCookie(req, "aliscore_session");

  if (token) {
    sessions.delete(token);
  }

  res.setHeader(
    "Set-Cookie",
    "aliscore_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
  );

  res.json({ ok: true });
});

app.put("/api/data", adminOnly, (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      error: "Yanlış məlumat"
    });
  }

  data = {
    leagues: Array.isArray(req.body.leagues)
      ? req.body.leagues
      : [],
    teams: Array.isArray(req.body.teams)
      ? req.body.teams
      : [],
    players: Array.isArray(req.body.players)
      ? req.body.players
      : [],
    matches: Array.isArray(req.body.matches)
      ? req.body.matches
      : []
  };

  saveData();

  res.json({
    ok: true,
    data
  });
});

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

app.listen(PORT, () => {
  console.log(`AliScore running on port ${PORT}`);
});
