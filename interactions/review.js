const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

const { REVIEWER_ROLES } = require("../config/roles");
const { REVIEW_LOG_CHANNEL } = require("../config/channels");

const pendingApprovals = require("../data/pendingApprovals");

const messages = require("../utils/messages");
const parseAttachments = require("../utils/attachmentParser");

module.exports = async function review(client, interaction) {

    // ==========================
    // Review Context Menu
    // ==========================

    if (interaction.isMessageContextMenuCommand()) {

        if (interaction.commandName !== "Review") return;

        const member = interaction.member;

        const hasPermission = REVIEWER_ROLES.some(roleId =>
            member.roles.cache.has(roleId)
        );

        if (!hasPermission) {
            await interaction.reply({
                content: "❌ access **DENIED...** sorry!! i can only let Studio Leadership and Project Directors review assets.",
                ephemeral: true,
            });

            return;
        }

        pendingApprovals.set(interaction.user.id, {
            messageId: interaction.targetMessage.id,
            channelId: interaction.channel.id,
            attachments: [...interaction.targetMessage.attachments.values()],
        });

        console.log("Stored message:", interaction.targetMessage.id);
        console.log("Stored attachment count:", interaction.targetMessage.attachments.size);

        const reviewMenu = new StringSelectMenuBuilder()
            .setCustomId("review_type")
            .setPlaceholder("select a method...")
            .addOptions([
                {
                    label: "Approve",
                    value: "approve",
                    emoji: "✅",
                    description: "approve this asset for implementation!",
                },
                {
                    label: "Needs Improvement",
                    value: "improvement",
                    emoji: "🛠️",
                    description: "request constructive changes and adjustments!",
                },

            ]);

        await interaction.reply({
            content: "✨ **how should i review the asset?**",
            components: [
                new ActionRowBuilder().addComponents(reviewMenu),
            ],
            ephemeral: true,
        });

        return;
    }

    // ==========================
    // Review Type Dropdown
    // ==========================

    if (interaction.isStringSelectMenu() && interaction.customId === "review_type") {

        const approval = pendingApprovals.get(interaction.user.id);

        if (!approval) {
            return interaction.reply({
                content: "❌ This review expired.",
                ephemeral: true,
            });
        }

        approval.reviewType = interaction.values[0];

        const gameMenu = new StringSelectMenuBuilder()
            .setCustomId("review_game")
            .setPlaceholder("select a project...")
            .addOptions([
                {
                    label: "SEEKING",
                    value: "SEEKING",
                    emoji: "🥽",
                },
            ]);

        await interaction.update({
            content: "🎮 **which game should i review the asset for?**",
            components: [
                new ActionRowBuilder().addComponents(gameMenu),
            ],
        });

        return;
    }


    // ==========================
    // Game Dropdown
    // ==========================

    if (interaction.isStringSelectMenu() && interaction.customId === "review_game") {

        const approval = pendingApprovals.get(interaction.user.id);

        if (!approval) {
            return interaction.reply({
                content: "❌ this review expired.",
                ephemeral: true,
            });
        }

        approval.game = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId("review_notes")
            .setTitle("Review Asset");

        const notes = new TextInputBuilder()
            .setCustomId("notes")
            .setLabel("Additional Notes")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Optional")
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(notes)
        );

        await interaction.showModal(modal);

        return;
    }

    // ==========================
    // Review Modal
    // ==========================

    if (interaction.isModalSubmit() && interaction.customId === "review_notes") {

        const approval = pendingApprovals.get(interaction.user.id);

        if (!approval) {
            return interaction.reply({
                content: "❌ this review EXPIRED...",
                ephemeral: true,
            });
        }

        const channel = await client.channels.fetch(approval.channelId);
        const message = await channel.messages.fetch(approval.messageId);

        console.log("Fetched message:", message.id);
        console.log("Fetched attachment count:", message.attachments.size);

        const notes = interaction.fields.getTextInputValue("notes");

        let reviewMessage = "";

        switch (approval.reviewType) {

            case "approve":
                reviewMessage = messages.approved(
                    message,
                    approval,
                    notes,
                    interaction.member.displayName
                );
                break;

            case "improvement":
                reviewMessage = messages.needsImprovement(
                    message,
                    approval,
                    notes,
                    interaction.member.displayName
                );
                break;

        }

        await message.reply(reviewMessage);

        if (approval.reviewType === "approve") {

            const logChannel = await client.channels.fetch(REVIEW_LOG_CHANNEL);

            const files = parseAttachments(approval.attachments);

            const implementButton = new ButtonBuilder()
                .setCustomId(`implement_${approval.channelId}_${approval.messageId}`)
                .setLabel("Mark Implemented")
                .setEmoji("🚀")
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder()
                .addComponents(implementButton);
            
            const sourceButton = new ButtonBuilder()
    .setCustomId(`source_${approval.channelId}_${approval.messageId}`)
    .setLabel("Mark as Source")
    .setEmoji("📁")
    .setStyle(ButtonStyle.Secondary);

const row = new ActionRowBuilder()
    .addComponents(implementButton, sourceButton);
         await logChannel.send({
    content: messages.reviewLog(
        message,
        approval,
        files,
        notes,
        interaction.member.displayName
    ),
    components: [row],
});

        }

        await interaction.reply({
            content: "✨ review submitted successfully!",
            ephemeral: true,
        });

        pendingApprovals.delete(interaction.user.id);

        return;
    }

};
