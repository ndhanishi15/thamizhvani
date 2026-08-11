"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");

const authRoutes =
    require("./routes/auth");

const patientRoutes =
    require("./routes/patients");

const doctorRoutes =
    require("./routes/doctors");

const appointmentRoutes =
    require("./routes/appointments");

const medicineRoutes =
    require("./routes/medicines");

const emergencyRoutes =
    require("./routes/emergency");


const app = express();

const PORT =
    process.env.PORT || 5000;


const databasePath =
    path.resolve(
        process.env.DATABASE_FILE ||
        "./database/smartcare.db"
    );


const db =
    new Database(databasePath);


db.pragma(
    "foreign_keys = ON"
);


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);


app.use(
    express.json({
        limit: "1mb"
    })
);


app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================================
   STATIC FRONTEND
========================================================= */

app.use(
    express.static(
        path.join(__dirname)
    )
);


/* =========================================================
   API ROUTES
========================================================= */

app.use(
    "/api/auth",
    authRoutes(db)
);


app.use(
    "/api/patients",
    patientRoutes(db)
);


app.use(
    "/api/doctors",
    doctorRoutes(db)
);


app.use(
    "/api/appointments",
    appointmentRoutes(db)
);


app.use(
    "/api/medicines",
    medicineRoutes(db)
);


app.use(
    "/api/emergency",
    emergencyRoutes(db)
);


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            success: true,
            application: "SmartCare-360",
            status: "online",
            timestamp:
                new Date().toISOString()
        });

    }
);


/* =========================================================
   DEFAULT PAGE
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);


/* =========================================================
   404 API
========================================================= */

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({
            success: false,
            message: "API endpoint not found."
        });

    }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
    (error, req, res, next) => {

        console.error(
            "Server Error:",
            error
        );


        res.status(500).json({
            success: false,
            message:
                "Internal server error."
        });

    }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(`
╔══════════════════════════════════════════╗
║          SMARTCARE-360 SERVER            ║
╠══════════════════════════════════════════╣
║ Server:  http://localhost:${PORT}          ║
║ API:     http://localhost:${PORT}/api      ║
║ Status:  ONLINE                          ║
╚══════════════════════════════════════════╝
        `);

    }
);