const express = require("express");
const { exec } = require("child_process");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();
const PORT = process.env.APP_PORT || 3000; // Backend port
const TILESERVER_PORT = process.env.TILESERVER_PORT || 8080; // TileServer GL Light port

// Path to MBTiles file
const MBTILES_PATH = path.join(__dirname, "../data", "osm-2020-02-10-v3.11_japan_nagoya.mbtiles");

// Start TileServer GL Light
const tileserver = exec(
    `tileserver-gl-light --port ${TILESERVER_PORT} --mbtiles ${MBTILES_PATH}`,
    (error, stdout, stderr) => {
        if (error) console.error(`Error: ${error.message}`);
        if (stderr) console.error(`TileServerGL Light: ${stderr}`);
        console.log(`TileServerGL Light running at http://localhost:${TILESERVER_PORT}`);
    }
);

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
