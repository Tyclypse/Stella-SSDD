const { getRandomEncouragement } = require("../utils/dailyEncouragements");

const ENCOURAGEMENT_CHANNEL_ID = "1512571548995813638";

async function sendDailyEncouragement(client) {
    try {
        const channel = await client.channels.fetch(ENCOURAGEMENT_CHANNEL_ID);

        if (!channel || !channel.isTextBased()) {
            console.error("Daily encouragement channel is missing or not text-based.");
            return;
        }

        await channel.send(getRandomEncouragement());
        console.log("Sent daily encouragement.");
    } catch (error) {
        console.error("Failed to send daily encouragement:", error);
    }
}

let lastSentDate = null;

function getEasternTimeParts() {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const parts = Object.fromEntries(
        formatter.formatToParts(new Date()).map(part => [part.type, part.value])
    );

    return {
        dateKey: parts.year + "-" + parts.month + "-" + parts.day,
        hour: Number(parts.hour),
        minute: Number(parts.minute),
    };
}

function scheduleDailyEncouragement(client) {
    setInterval(async () => {
        const now = getEasternTimeParts();

        if (
            now.hour === 12 &&
            now.minute === 0 &&
            lastSentDate !== now.dateKey
        ) {
            lastSentDate = now.dateKey;
            await sendDailyEncouragement(client);
        }
    }, 60 * 1000);

    console.log("Daily encouragement scheduled for 12:00 PM America/New_York.");
}

module.exports = scheduleDailyEncouragement;
