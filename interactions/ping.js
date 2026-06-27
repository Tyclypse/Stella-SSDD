module.exports = async function ping(interaction) {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName !== "ping") return;

    await interaction.reply("🏓 pong!!");

};