require("dotenv").config();

const {
    REST,
    Routes,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
} = require("discord.js");

const commands = [
    new SlashCommandBuilder()
        .setName("changelog")
        .setDescription("Manage game changelogs.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("commit")
                .setDescription("Commit a new game version.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("revert")
                .setDescription("Revert to a previous version.")
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName("devlog")
        .setDescription("Manage development logs.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("commit")
                .setDescription("Commit a new development build.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("revert")
                .setDescription("Revert to a previous development build.")
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName("targetversion")
        .setDescription("Manage target versions.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("set")
                .setDescription("Set a target version.")
                .addStringOption(option =>
                    option
                        .setName("game")
                        .setDescription("Game")
                        .setRequired(true)
                        .setChoices(
                            {
                                name: "SEEKING",
                                value: "SEEKING",
                            }
                        )
                )
                .addStringOption(option =>
                    option
                        .setName("version")
                        .setDescription("Version, such as 1.0.0")
                        .setRequired(true)
                )
        )
        .toJSON(),

    new ContextMenuCommandBuilder()
        .setName("Review")
        .setType(ApplicationCommandType.Message)
        .toJSON(),

    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Checks if Stella is awake!")
        .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

const CLIENT_ID = "1519921538726625291";
const GUILD_ID = "1512569608639353035";

(async () => {
    try {
        console.log("Registering commands...");

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log("Commands registered.");
    } catch (error) {
        console.error(error);
    }
})();