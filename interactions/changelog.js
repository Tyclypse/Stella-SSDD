const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const CHANGELOG_FILE = path.join(
    __dirname,
    "../data/changelogs.json"
);

module.exports = async function changelog(client, interaction) {

    // ==========================
    // /changelog commit
    // ==========================

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName !== "changelog") return;

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "commit") {

            const gameMenu = new StringSelectMenuBuilder()
                .setCustomId("changelog_game")
                .setPlaceholder("select a project...")
                .addOptions([
                    {
                        label: "SEEKING",
                        value: "SEEKING",
                        emoji: "🥽",
                    },
                ]);

            await interaction.reply({
                content: "🎮 **which game should i commit to?**",
                components: [
                    new ActionRowBuilder().addComponents(gameMenu),
                ],
                ephemeral: true,
            });

            return;
        }

        if (subcommand === "revert") {

            const gameMenu = new StringSelectMenuBuilder()
                .setCustomId("changelog_revert_game")
                .setPlaceholder("select a project...")
                .addOptions([
                    {
                        label: "SEEKING",
                        value: "SEEKING",
                        emoji: "🥽",
                    },
                ]);

            await interaction.reply({
                content: "⏪ **which game would you like to revert?**",
                components: [
                    new ActionRowBuilder().addComponents(gameMenu),
                ],
                ephemeral: true,
            });

            return;
        }

        const gameMenu = new StringSelectMenuBuilder()
            .setCustomId("changelog_game")
            .setPlaceholder("select a project...")
            .addOptions([
                {
                    label: "SEEKING",
                    value: "SEEKING",
                    emoji: "🥽",
                },
            ]);

        await interaction.reply({
            content: "🎮 **which game are you committing a version for?**",
            components: [
                new ActionRowBuilder().addComponents(gameMenu),
            ],
            ephemeral: true,
        });

        return;
    }

    // ==========================
    // Game Dropdown
    // ==========================

    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "changelog_game"
    ) {

        const game = interaction.values[0];

        const versionMenu = new StringSelectMenuBuilder()
            .setCustomId(`changelog_increment_${game}`)
            .setPlaceholder("select an update...")
            .addOptions([
                {
                    label: "Major",
                    value: "major",
                    emoji: "📢",
                    description: "0.0.0 → 1.0.0",
                },
                {
                    label: "Minor",
                    value: "minor",
                    emoji: "👌",
                    description: "0.0.0 → 0.1.0",
                },
                {
                    label: "Patch",
                    value: "patch",
                    emoji: "🔧",
                    description: "0.0.0 → 0.0.1",
                },
            ]);

        await interaction.update({
            content: "📦 **which version number should I increase?**",
            components: [
                new ActionRowBuilder().addComponents(versionMenu),
            ],
        });

        return;
    }

    // ==========================
    // Version Dropdown
    // ==========================

    if (
        interaction.isStringSelectMenu() &&
        interaction.customId.startsWith("changelog_increment_")
    ) {

        const game = interaction.customId.replace(
            "changelog_increment_",
            ""
        );

        const increment = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`changelog_commit_${game}_${increment}`)
            .setTitle("Commit Changelog");

        const changes = new TextInputBuilder()
            .setCustomId("changes")
            .setLabel("Changelog")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder(`One change per line...
Destroyed the entire game
Removed Herobrine`)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(changes)
        );

        await interaction.showModal(modal);

        return;
    }

    // ==========================
    // Commit Modal
    // ==========================

    if (
        interaction.isModalSubmit() &&
        interaction.customId.startsWith("changelog_commit_")
    ) {

        const [, , game, increment] = interaction.customId.split("_");

        const changes = interaction.fields.getTextInputValue("changes");
        const formattedChanges = changes
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => `• ${line}`)
            .join("\n");

        const data = JSON.parse(
            fs.readFileSync(CHANGELOG_FILE, "utf8")
        );

        const version = data[game];

        switch (increment) {

            case "major":
                version.major++;
                version.minor = 0;
                version.patch = 0;
                break;

            case "minor":
                version.minor++;
                version.patch = 0;
                break;

            case "patch":
                version.patch++;
                break;

        }

        const versionString =
            `${version.major}.${version.minor}.${version.patch}`;

        version.history.push({
            version: versionString,
            author: interaction.member.displayName,
            changes,
            date: new Date().toISOString(),
        });

        fs.writeFileSync(
            CHANGELOG_FILE,
            JSON.stringify(data, null, 4)
        );

        const changelogChannel =
            await client.channels.fetch("1520310354473783296");

        await changelogChannel.send(
            `# ✨ new ${game} version committed!

v${versionString}

**Changelog:**
${formattedChanges}

-# committed by ${interaction.member.displayName}`
        );

        await interaction.reply({
            content: `✨ committed **v${versionString}** successfully!`,
            ephemeral: true,
        });

        return;
    }

    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "changelog_revert_game"
    ) {

        const game = interaction.values[0];

        const data = JSON.parse(
            fs.readFileSync(CHANGELOG_FILE, "utf8")
        );

        const history = data[game].history;

        if (!history.length) {

            await interaction.reply({
                content: "❌ hmmmm... there aren't any previous versions to revert to...",
                ephemeral: true,
            });

            return;
        }

        const versionMenu = new StringSelectMenuBuilder()
            .setCustomId(`changelog_revert_version_${game}`)
            .setPlaceholder("Select a version...")
            .addOptions(
                history
                    .slice()
                    .reverse()
                    .map(entry => ({
                        label: `v${entry.version}`,
                        value: entry.version,
                        description: entry.author,
                    }))
            );

        await interaction.update({
            content: "⏪ **which version should i restore?**",
            components: [
                new ActionRowBuilder().addComponents(versionMenu),
            ],
        });

        return;
    }

    // ==========================
    // Revert Version Dropdown
    // ==========================

    if (
        interaction.isStringSelectMenu() &&
        interaction.customId.startsWith("changelog_revert_version_")
    ) {

        const game = interaction.customId.replace(
            "changelog_revert_version_",
            ""
        );

        const version = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`changelog_revert_${game}_${version}`)
            .setTitle("Revert Version");

        const reason = new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Reason for reverting")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Optional")
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(reason)
        );

        await interaction.showModal(modal);

        return;
    }

    // ==========================
    // Revert Modal
    // ==========================

    if (
        interaction.isModalSubmit() &&
        interaction.customId.startsWith("changelog_revert_")
    ) {

        const [, , game, version] = interaction.customId.split("_");

        const reason =
            interaction.fields.getTextInputValue("reason") || "No reason provided.";

        const data = JSON.parse(
            fs.readFileSync(CHANGELOG_FILE, "utf8")
        );

        const gameData = data[game];

        const [major, minor, patch] = version.split(".").map(Number);

        gameData.major = major;
        gameData.minor = minor;
        gameData.patch = patch;

        gameData.history.push({
            version,
            author: interaction.member.displayName,
            changes: `Reverted to v${version}`,
            reason,
            date: new Date().toISOString(),
        });

        fs.writeFileSync(
            CHANGELOG_FILE,
            JSON.stringify(data, null, 4)
        );

        const changelogChannel =
            await client.channels.fetch("1520310354473783296");

        await changelogChannel.send(
            `# ⚠️ ${game} game version reverted!

v${version}

**Reason:**
${reason}

-# reverted by ${interaction.member.displayName}`
        );

        await interaction.reply({
            content: `⏪ successfully reverted **${game}** to **v${version}**!`,
            ephemeral: true,
        });

        return;
    }
};