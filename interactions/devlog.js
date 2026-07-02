const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");

const { db } = require("../database/db");

const DEVLOG_CHANNEL_ID = "1520310354473783296";

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

async function getTargetVersion(game) {
    await ensureTargetVersionTable();

    const target = await db.query(
        `SELECT target_major, target_minor, target_patch
         FROM target_versions
         WHERE game = $1`,
        [game]
    );

    if (target.rows[0]) {
        return {
            major: target.rows[0].target_major,
            minor: target.rows[0].target_minor,
            patch: target.rows[0].target_patch,
        };
    }

    const release = await db.query(
        `SELECT major, minor, patch FROM changelogs WHERE game = $1`,
        [game]
    );

    return release.rows[0] ?? {
        major: 0,
        minor: 0,
        patch: 0,
    };
}

async function ensureDevlogExists(game) {
    const target = await getTargetVersion(game);

    await db.query(
        `INSERT INTO devlogs (game, major, build)
         VALUES ($1, $2, 0)
         ON CONFLICT (game) DO NOTHING`,
        [game, target.major]
    );
}

module.exports = async function devlog(client, interaction) {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName !== "devlog") return;

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "commit") {
            const gameMenu = new StringSelectMenuBuilder()
                .setCustomId("devlog_game")
                .setPlaceholder("select a project...")
                .addOptions([
                    {
                        label: "SEEKING",
                        value: "SEEKING",
                        emoji: "🥽",
                    },
                ]);

            await interaction.reply({
                content: "🎮 **which game should i make a development log for?**",
                components: [new ActionRowBuilder().addComponents(gameMenu)],
                ephemeral: true,
            });

            return;
        }

        if (subcommand === "revert") {
            const gameMenu = new StringSelectMenuBuilder()
                .setCustomId("devlog_revert_game")
                .setPlaceholder("select a project...")
                .addOptions([
                    {
                        label: "SEEKING",
                        value: "SEEKING",
                        emoji: "🥽",
                    },
                ]);

            await interaction.reply({
                content: "⏪ **which game development build would you like to revert?**",
                components: [new ActionRowBuilder().addComponents(gameMenu)],
                ephemeral: true,
            });

            return;
        }
    }

    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "devlog_game"
    ) {
        const game = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`devlog_commit_${game}`)
            .setTitle("Commit Development Log");

        const changes = new TextInputBuilder()
            .setCustomId("changes")
            .setLabel("Development Changes")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("One change per line...")
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(changes));

        await interaction.showModal(modal);
        return;
    }

    if (
        interaction.isModalSubmit() &&
        interaction.customId.startsWith("devlog_commit_")
    ) {
        const game = interaction.customId.replace("devlog_commit_", "");
        const changes = interaction.fields.getTextInputValue("changes");
        const formattedChanges = changes
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => `• ${line}`)
            .join("\n");

        await ensureDevlogExists(game);

        const target = await getTargetVersion(game);

        const currentDevlog = await db.query(
            `SELECT major FROM devlogs WHERE game = $1`,
            [game]
        );

        if (currentDevlog.rows[0].major !== target.major) {
            await db.query(
                `UPDATE devlogs SET major = $1, build = 0 WHERE game = $2`,
                [target.major, game]
            );
        }

        const updated = await db.query(
            `UPDATE devlogs
             SET build = build + 1
             WHERE game = $1
             RETURNING major, build`,
            [game]
        );

        const devlog = updated.rows[0];
        const versionString = `v${target.major}.${target.minor}.${target.patch} development build #${devlog.build}`;

        await db.query(
            `INSERT INTO devlog_history (game, major, build, version, author, changes)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                game,
                target.major,
                devlog.build,
                versionString,
                interaction.member.displayName,
                changes,
            ]
        );

        const devlogChannel = await client.channels.fetch(DEVLOG_CHANNEL_ID);

        await devlogChannel.send(
            `# 🛠️ new ${game} development log!\n\n${versionString}\n\n${formattedChanges}\n\n-# committed by ${interaction.member.displayName}`
        );

        await interaction.reply({
            content: `🛠️ committed **${versionString}** successfully!`,
            ephemeral: true,
        });

        return;
    }

    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "devlog_revert_game"
    ) {
        const game = interaction.values[0];

        const result = await db.query(
            `SELECT version, author
             FROM devlog_history
             WHERE game = $1
             ORDER BY id DESC
             LIMIT 25`,
            [game]
        );

        const history = result.rows;

        if (!history.length) {
            await interaction.reply({
                content: "❌ hmmmm... there aren't any previous development builds to revert to...",
                ephemeral: true,
            });

            return;
        }

        const versionMenu = new StringSelectMenuBuilder()
            .setCustomId(`devlog_revert_version_${game}`)
            .setPlaceholder("Select a development build...")
            .addOptions(
                history.map(entry => ({
                    label: entry.version,
                    value: entry.version,
                    description: entry.author,
                }))
            );

        await interaction.update({
            content: "⏪ **which development build should i restore?**",
            components: [new ActionRowBuilder().addComponents(versionMenu)],
        });

        return;
    }

    if (
        interaction.isStringSelectMenu() &&
        interaction.customId.startsWith("devlog_revert_version_")
    ) {
        const game = interaction.customId.replace("devlog_revert_version_", "");
        const version = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`devlog_revert_${game}_${version}`)
            .setTitle("Revert Development Build");

        const reason = new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Reason for reverting")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Optional")
            .setRequired(false);

        modal.addComponents(new ActionRowBuilder().addComponents(reason));

        await interaction.showModal(modal);
        return;
    }

    if (
        interaction.isModalSubmit() &&
        interaction.customId.startsWith("devlog_revert_")
    ) {
        const raw = interaction.customId.replace("devlog_revert_", "");
        const splitIndex = raw.indexOf("_");
        const game = raw.slice(0, splitIndex);
        const version = raw.slice(splitIndex + 1);

        const reason = interaction.fields.getTextInputValue("reason") || "No reason provided.";

        const match = version.match(/^v(\d+)\.(\d+)\.(\d+) development build #(\d+)$/);

        if (!match) {
            await interaction.reply({
                content: "❌ i couldn't read that development build version.",
                ephemeral: true,
            });

            return;
        }

        const major = Number(match[1]);
        const build = Number(match[4]);

        await db.query(
            `INSERT INTO devlogs (game, major, build)
             VALUES ($1, $2, $3)
             ON CONFLICT (game)
             DO UPDATE SET major = $2, build = $3`,
            [game, major, build]
        );

        await db.query(
            `INSERT INTO devlog_history (game, major, build, version, author, changes, reason)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                game,
                major,
                build,
                version,
                interaction.member.displayName,
                `Reverted to ${version}`,
                reason,
            ]
        );

        const devlogChannel = await client.channels.fetch(DEVLOG_CHANNEL_ID);

        await devlogChannel.send(
            `# ⚠️ ${game} development build reverted!\n\n${version}\n\n**Reason:**\n${reason}\n\n-# reverted by ${interaction.member.displayName}`
        );

        await interaction.reply({
            content: `⏪ successfully reverted **${game}** to **${version}**!`,
            ephemeral: true,
        });

        return;
    }
};
