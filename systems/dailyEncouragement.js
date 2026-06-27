const { getRandomEncouragement } = require("../utils/dailyEncouragements");

const ENCOURAGEMENT_CHANNEL_ID = "1512571548995813638";
const TIME_ZONE = "America/New_York";
const TARGET_HOUR = 12;
const TARGET_MINUTE = 0;
const TARGET_SECOND = 0;

function getTimeParts(date) {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    return Object.fromEntries(
        formatter.formatToParts(date).map(part => [part.type, part.value])
    );
}

function getTimeZoneOffset(date) {
    const parts = getTimeParts(date);

    const localAsUtc = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second)
    );

    return localAsUtc - date.getTime();
}

function getNextNoonEastern() {
    const now = new Date();
    const easternNow = getTimeParts(now);

    let targetUtc = Date.UTC(
        Number(easternNow.year),
        Number(easternNow.month) - 1,
        Number(easternNow.day),
        TARGET_HOUR,
        TARGET_MINUTE,
        TARGET_SECOND
    );

    targetUtc -= getTimeZoneOffset(new Date(targetUtc));

    if (targetUtc <= now.getTime()) {
        targetUtc += 24 * 60 * 60 * 1000;
        targetUtc -= getTimeZoneOffset(new Date(targetUtc));
    }

    return new Date(targetUtc);
}

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
    const nextRun = getNextNoonEastern();
    const delay = nextRun.getTime() - Date.now();

    console.log(`Next daily encouragement scheduled for ${nextRun.toISOString()}`);

    setTimeout(async () => {
        await sendDailyEncouragement(client);
        scheduleDailyEncouragement(client);
    }, delay);
}

module.exports = scheduleDailyEncouragement;
