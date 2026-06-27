const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} = require("discord.js");

const messages = require("../utils/messages");

module.exports = async function implement(client, interaction) {

    // ==========================
    // Implementation Modal
    // ==========================

    if (
        interaction.isModalSubmit() &&
        interaction.customId.startsWith("implement_")
    ) {

        const [, channelId, messageId] = interaction.customId.split("_");

        const channel = await client.channels.fetch(channelId);
        const originalMessage = await channel.messages.fetch(messageId);

        const notes = interaction.fields.getTextInputValue("feedback");

        await originalMessage.reply(
            messages.implemented(
                originalMessage,
                notes,
                interaction.member.displayName
            )
        );

        const oldContent = interaction.message.content;

        const creator =
            oldContent.match(/\*\*creator:\*\*\n(.+)/)?.[1] ?? "Unknown";

        const game =
            oldContent.match(/\*\*game:\*\*\n(.+)/)?.[1] ?? "Unknown";

        const files =
            oldContent.match(/\*\*here's what i found:\*\*\n([\s\S]*?)\n\n\*\*feedback:/)?.[1]
            ?? "...umm... i couldn't find any supported files. 😅";

        const originalMessageLink =
            oldContent.match(/\*\*original message:\*\*\n(.+)/)?.[1] ?? "Unknown";

        const approver =
            oldContent.match(/originally approved by (.+)/)?.[1] ?? "Unknown";

        await interaction.update({
            content:
                `🚀 **this asset has been implemented!!**

woohoo!! this one made it into **${game}**! 🎉

**creator:**
${creator}

**game:**
${game}

**files:**
${files}

**original message:**
${originalMessageLink}

-# originally approved by ${approver}
-# implemented by ${interaction.member.displayName}`,
            components: [],
        });

        return;
    }


    // ==========================
    // Implement Button
    // ==========================

    if (interaction.isButton()) {

        if (!interaction.customId.startsWith("implement_")) return;

        const modal = new ModalBuilder()
            .setCustomId(interaction.customId)
            .setTitle("Mark Asset Implemented");

        const feedback = new TextInputBuilder()
            .setCustomId("feedback")
            .setLabel("Implementation Notes")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Optional")
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(feedback)
        );

        await interaction.showModal(modal);

        return;
    }




};