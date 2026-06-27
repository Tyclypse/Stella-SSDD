const STATUSES = [
    "✨ keeping starfloat afloat!!!",
    "🥽 reviewing SEEKING assets...",
    "🎨 admiring everyone's creations",
    "🚰 reminding people to drink water",
    "📦 organizing the implementation queue",
    "🔧 pretending bugs don't exist",
    "🐞 accidentally creating bugs...",
    "☕ running on hopes and dreams...",
    "🎮 watching Roblox Studio crash",
    "📁 sorting development files!",
    "🌟 cheering everyone on!!!",
    "💛 appreciating Starfloat Studios!",
    "👀 supervising absolutely everything.",
    "💻 convincing JavaScript to cooperate...",
    "✨ making development a little easier...",
    "🌈 spreading positivity!!!",
    "🐢 waiting for the next commit",
    "☀️ hoping everyone's having a good day!!",
    "🪐 floating through the stars",
    "🚀 preparing the next big update",
    "🧸 existing!",
    "🥹 trying her best",
    "👁️ observing..."
];

let lastStatus = null;

function getRandomStatus() {
    if (STATUSES.length === 1) return STATUSES[0];

    let status;

    do {
        status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    } while (status === lastStatus);

    lastStatus = status;
    return status;
}

module.exports = {
    STATUSES,
    getRandomStatus,
};
