const { Pool } = require("pg");

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function initDatabase() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS changelogs (
            game TEXT PRIMARY KEY,
            major INTEGER NOT NULL DEFAULT 0,
            minor INTEGER NOT NULL DEFAULT 0,
            patch INTEGER NOT NULL DEFAULT 0
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS changelog_history (
            id SERIAL PRIMARY KEY,
            game TEXT NOT NULL,
            version TEXT NOT NULL,
            author TEXT NOT NULL,
            changes TEXT NOT NULL,
            reason TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS devlogs (
            game TEXT PRIMARY KEY,
            major INTEGER NOT NULL DEFAULT 0,
            build INTEGER NOT NULL DEFAULT 0
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS devlog_history (
            id SERIAL PRIMARY KEY,
            game TEXT NOT NULL,
            major INTEGER NOT NULL DEFAULT 0,
            build INTEGER NOT NULL DEFAULT 0,
            version TEXT NOT NULL,
            author TEXT NOT NULL,
            changes TEXT NOT NULL,
            reason TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

module.exports = {
    db,
    initDatabase,
};
