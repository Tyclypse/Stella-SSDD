const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} = require("discord.js");

const messages = require("../utils/messages");

module.exports = async function source(client, interaction) {
    if (
        interaction.isModalSubmit() &&
        interaction.customId.startsWith("source_")
    ) {
        const [, channelId, messageId] = interaction.customId.split("_");

        const channel = await client.channels.fetch(channelId);
        const originalMessage = await channel.messages.fetch(messageId);

        const notes = interaction.fields.getTextInputValue("feedback");

        await originalMessage.reply(
            messages.sourceAsset(
                originalMessage,
                {
                    game:
                        interaction.message.content.match(/\*\*game:\*\*\n(.+)/)?.[1]
                        ?? "Unknown",
                },
                notes,
                interaction.member.displayName
            )
        );

        await interaction.update({
            content: interaction.message.content.replace(
                "✨ **hiiiiiiiiii! i found a new approved asset ready for implementation!!**",
                "📁 **this asset has been classified as a source asset!!**"
            ),
            components: [],
        });

        return;
    }

    if (interaction.isButton()) {
        if (!interaction.customId.startsWith("source_")) return;

        const modal = new ModalBuilder()
            .setCustomId(interaction.customId)
            .setTitle("Mark as Source Asset");

        const feedback = new TextInputBuilder()
            .setCustomId("feedback")
            .setLabel("Source Notes")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Optional")
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(feedback)
        );

        await interaction.showModal(modal);
    }
};