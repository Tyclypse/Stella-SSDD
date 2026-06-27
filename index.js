console.log("HELLO");
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

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setActivity("✨ keeping starfloat afloat!", {
    type: ActivityType.Playing,
  });
});

client.on("interactionCreate", async (interaction) => {

  await ping(interaction);
  await review(client, interaction);
  await implement(client, interaction);
  await changelog(client, interaction);

});

console.log(process.env.TOKEN ? "Token loaded" : "No token loaded");

client.login(process.env.TOKEN);