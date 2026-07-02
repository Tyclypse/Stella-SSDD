require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  ActivityType,
  ModalBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

const pendingApprovals = require("./data/pendingApprovals");

const { REVIEWER_ROLES } = require("./config/roles");
const { REVIEW_LOG_CHANNEL } = require("./config/channels");

const messages = require("./utils/messages");
const parseAttachments = require("./utils/attachmentParser");

const ping = require("./interactions/ping");
const review = require("./interactions/review");
const implement = require("./interactions/implement");
const changelog = require("./interactions/changelog");
const devlog = require("./interactions/devlog");
const targetversion = require("./interactions/targetversion");
const source = require("./interactions/source");


const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const { getRandomStatus } = require("./utils/statuses");
const scheduleDailyEncouragement = require("./systems/dailyEncouragement");

function updatePresence() {
    client.user.setActivity(getRandomStatus(), {
        type: ActivityType.Playing,
    });
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
 scheduleDailyEncouragement(client);
  updatePresence();
    setInterval(updatePresence, 0.5 * 60 * 1000);
});

client.on("interactionCreate", async (interaction) => {

  await ping(interaction);
  await review(client, interaction);
  await implement(client, interaction);
  await changelog(client, interaction);
  await devlog(client, interaction);
  await targetversion(client, interaction);
  await source(client, interaction);

});

const { initDatabase } = require("./database/db");

initDatabase()
    .then(() => client.login(process.env.TOKEN))
    .catch(console.error);

console.log(process.env.TOKEN ? "Token loaded" : "No token loaded");

const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const OVERRIDE_CHANNEL = "1512571548995813638";

console.log("Stella Override Ready!");

rl.on("line", async (line) => {

    if (!line.trim()) return;

    try {

        const channel = await client.channels.fetch(OVERRIDE_CHANNEL);

        await channel.send(line);

        console.log("✓ Sent!");

    } catch (err) {

        console.error(err);

    }

});