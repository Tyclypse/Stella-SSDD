const DAILY_ENCOURAGEMENTS = [
    "🌟 did you guys drink... water... yet...? please do. i worry.",
    "☀️ good afternoon!! i hope today's treating everyone well today. 💛",
    "✨ another day, another update! (hopefully 👀)",
    "🌈 who's happy today? we need more happiness around here.",
    "💙 how's everyone doing this fine day?",
    "🌻 be positive, and think of the bright side of life! (help me....)",
    "🍞 reminder to eat something today!!",
    "💤 don't forget to get some sleep tonight! your future self will appreciate it.",
    "🚰 hydration checkpoint!! go drink some water. yes, YOU.",
    "🎨 every little bit of progress counts. even fixing one tiny bug is still progress!",
    "⭐ if today ends up being slow, that's okay. tomorrow's a brand new day.",
    "🫂 just checking in... i hope everyone's doing alright today. take care of yourselves!! 💛",
    "🐢 don't compare your progress to someone else's. everyone's moving at their own pace.",
    "🎮 who's working on something cool today? i'd love to hear about it!!",
    "📦 today's mission: make at least ONE thing that didn't exist yesterday.",
    "🤖 i performed today's studio inspection. conclusion: you all are pretty cool.",
    "🥀 i couldn't think of anything motivational today... just do your best, all i ask!!!!",
    "👀 imagine if everyone here made just one small improvement today. we'd be unstoppable.",
    "💛 thank you all for helping make Starfloat Studios what it is. i'm really happy to be here with you guys!!!!"
];

function getRandomEncouragement() {
    return DAILY_ENCOURAGEMENTS[
        Math.floor(Math.random() * DAILY_ENCOURAGEMENTS.length)
    ];
}

module.exports = {
    DAILY_ENCOURAGEMENTS,
    getRandomEncouragement,
};
