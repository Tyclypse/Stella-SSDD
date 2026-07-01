require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const [, , channelId, ...messageParts] = process.argv;
const message = messageParts.join(" ");

if (!channelId || !message) {
    console.log("Usage: node override.js <channelId> <message>");
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once("ready", async () => {
    try {
        const channel = await client.channels.fetch(channelId);
        await channel.send(message);
        console.log("Sent as Stella!");
    } catch (error) {
        console.error(error);
    } finally {
        client.destroy();
    }
});

client.login(process.env.TOKEN);
