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
        .setName("ping")
        .setDescription("Checks if Stella is awake!")
        .toJSON(),

    new ContextMenuCommandBuilder()
        .setName("Review")
        .setType(ApplicationCommandType.Message)
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

        console.log("✅ Commands registered!");
    } catch (error) {
        console.error(error);
    }
})();