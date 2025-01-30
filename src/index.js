const express = require("express");
const { exec } = require("child_process");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require('cors')
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(cors());

const PORT = process.env.APP_PORT || 3000; // Backend port
const TILESERVER_PORT = process.env.TILESERVER_PORT || 8080; // TileServer GL Light port
// Path to MBTiles file
const MBTILES_PATH = path.join(__dirname, "../data", "osm-2020-02-10-v3.11_asia_north-korea.mbtiles");
const DB_PATH = path.join(__dirname, "../data", "nodes.sqlite3");


const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Error opening DB_PATH database:", err.message);
    } else {
        console.log("Connected to DB_PATH database.");
    }
});
// Start TileServer GL Light
const tileserver = exec(
    `tileserver-gl-light --port ${TILESERVER_PORT} --mbtiles ${MBTILES_PATH}`,
    (error, stdout, stderr) => {
        if (error) console.error(`Error: ${error.message}`);
        if (stderr) console.error(`TileServerGL Light: ${stderr}`);
        console.log(`TileServerGL Light running at http://localhost:${TILESERVER_PORT}`);
    }
);

app.get("/search", (req, res) => {
    const { location } = req.query
    if (!location) {
        return res.status(400).json({ error: "Query is required" });
    }

    const sql = `
    SELECT id, name, latitude, longitude, kname, laname
    FROM nodes
    WHERE name LIKE ? OR kname LIKE ? OR laname LIKE ?
    LIMIT 20;
    `;
    console.log('[Tanga]', location)
    const params = [`%${location}%`, `%${location}%`, `%${location}%`];


    db.all(sql, params, (err, rows) => {
        console.log('[asdfasdf]', rows, err)
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows.map(r=>({
            ...r, 
            lat: r['latitude'],
            lon: r['longitude'],
            display_name: r['name'] || r['kname'] || r['laname']
        })));
    });
});

app.use(
    "/tiles",
    createProxyMiddleware({
        target: `http://localhost:${TILESERVER_PORT}`,
        changeOrigin: true,
        pathRewrite: { "^/tiles": "" }, // Remove "/tileserver" prefix
    })
);

// Stop TileServer GL on exit
process.on("exit", () => {
    tileserver.kill();
});

// Start Express server
app.listen(PORT, () => {
    console.log(`Backend API running at http://localhost:${PORT}`);
});
