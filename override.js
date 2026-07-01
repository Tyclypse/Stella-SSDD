require("dotenv").config();

const { REST, Routes } = require("discord.js");

const [, , channelId, ...messageParts] = process.argv;
const message = messageParts.join(" ");

if (!channelId || !message) {
    console.log("Usage: node override.js <channelId> <message>");
    process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

async function sendOverride() {
    try {
        await rest.post(Routes.channelMessages(channelId), {
            body: {
                content: message,
            },
        });

        console.log("Sent as Stella!");
    } catch (error) {
        console.error(error);
    }
}

sendOverride();
