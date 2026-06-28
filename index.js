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
const source = require("./interactions/source");

const STELLA_OVERRIDE = {
    enabled: true,
    channelId: "1520326152328183908",
};

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

if (STELLA_OVERRIDE.enabled) {
    process.stdin.on("data", async (data) => {
        const message = data.toString().trim();

        if (!message) return;

        const channel = await client.channels.fetch(STELLA_OVERRIDE.channelId);

        await channel.send(message);
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
  await source(client, interaction);

});

console.log(process.env.TOKEN ? "Token loaded" : "No token loaded");

client.login(process.env.TOKEN);
