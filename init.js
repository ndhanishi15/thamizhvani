"use strict";

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
require("dotenv").config();

const databasePath = path.resolve(
    process.env.DATABASE_FILE || "./database/smartcare.db"
);

const schemaPath = path.join(
    __dirname,
    "schema.sql"
);

const schema = fs.readFileSync(
    schemaPath,
    "utf8"
);

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

db.exec(schema);

console.log("SmartCare-360 database initialized.");

db.close();