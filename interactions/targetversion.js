const { db } = require("../database/db");

function parseVersion(version) {
    const match = version.trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/);

    if (!match) return null;

    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
    };
}

async function ensureTargetVersionTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS target_versions (
            game TEXT PRIMARY KEY,
            target_major INTEGER NOT NULL DEFAULT 0,
            target_minor INTEGER NOT NULL DEFAULT 0,
            target_patch INTEGER NOT NULL DEFAULT 0
        )
    `);
}

module.exports = async function targetversion(client, interaction) {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "targetversion") return;

    const subcommand = interaction.options.getSubcommand();

    if (subcommand !== "set") return;

    const game = interaction.options.getString("game");
    const versionInput = interaction.options.getString("version");
    const version = parseVersion(versionInput);

    if (!version) {
        await interaction.reply({
            content: "that version needs to look like `1.0.0` or `v1.0.0`.",
            ephemeral: true,
        });

        return;
    }

    await ensureTargetVersionTable();

    const existing = await db.query(
        `SELECT target_major, target_minor, target_patch
         FROM target_versions
         WHERE game = $1`,
        [game]
    );

    const oldTarget = existing.rows[0];
    const targetChanged = oldTarget && (
        oldTarget.target_major !== version.major ||
        oldTarget.target_minor !== version.minor ||
        oldTarget.target_patch !== version.patch
    );

    await db.query(
        `INSERT INTO target_versions (game, target_major, target_minor, target_patch)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (game)
         DO UPDATE SET
            target_major = $2,
            target_minor = $3,
            target_patch = $4`,
        [game, version.major, version.minor, version.patch]
    );

    await db.query(
        `INSERT INTO devlogs (game, major, build)
         VALUES ($1, $2, 0)
         ON CONFLICT (game) DO NOTHING`,
        [game, version.major]
    );

    if (targetChanged) {
        await db.query(
            `UPDATE devlogs
             SET major = $1, build = 0
             WHERE game = $2`,
            [version.major, game]
        );
    } else {
        await db.query(
            `UPDATE devlogs
             SET major = $1
             WHERE game = $2`,
            [version.major, game]
        );
    }

    await interaction.reply({
        content: `target version for **${game}** is now **v${version.major}.${version.minor}.${version.patch}**.`,
        ephemeral: true,
    });
};
