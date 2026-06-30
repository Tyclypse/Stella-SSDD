const cron = require("node-cron");
const { getRandomEncouragement } = require("../utils/dailyEncouragements");

const ENCOURAGEMENT_CHANNEL_ID = "1512571548995813638";
const TIME_ZONE = "America/New_York";
const CRON_SCHEDULE = "0 12 * * *";

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

function scheduleDailyEncouragement(client) {
    cron.schedule(
        CRON_SCHEDULE,
        async () => {
            await sendDailyEncouragement(client);
        },
        {
            timezone: TIME_ZONE,
        }
    );

    console.log(`Daily encouragement scheduled for 12:00 PM ${TIME_ZONE}.`);
}

module.exports = scheduleDailyEncouragement;
