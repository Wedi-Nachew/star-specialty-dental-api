const express = require("express");
const cors = require("cors");
const config = require("./config");
const db = require("./db");
const { success } = require("zod");

const app = express();

// app.use(cors({ origin: config.urls.frontend }));
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        service: "Star Dental API",
        time: new Date().toISOString(),
    });
});

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
