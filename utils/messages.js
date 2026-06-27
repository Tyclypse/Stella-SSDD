function approved(message, approval, notes, reviewer) {
    return `✅ **asset APPROVED!!**

congrats, ${message.member?.displayName ?? message.author.username}! this asset has been approved for implementation into **${approval.game}**!!!! good job!

*feedback:*
${notes || "none!"}

once again, good work!!
-# reviewer: ${reviewer}`;
}

function needsImprovement(message, approval, notes, reviewer) {
    return `🛠️ **asset needs improvement,**

nice work, ${message.member?.displayName ?? message.author.username}! you're almost there. this asset is heading in the right direction, but there are a few things to adjust before it's ready for **${approval.game}**!

*feedback:*
${notes || "none!"}

once those changes are made, feel free to submit it again!
-# reviewer: ${reviewer}`;
}

function implemented(message, approval, notes, reviewer) {
    return `🚀 **asset IMPLEMENTED!!**

woohoo, ${message.member?.displayName ?? message.author.username}! your asset has officially been implemented!!

*feedback:*
${notes || "none!"}

thank you for your hard work and contributions!
-# implemented by ${reviewer}`;
}

function sourceAsset(message, approval, notes, reviewer) {
    return `📁 **source asset ACCEPTED!!**

yay, ${message.member?.displayName ?? message.author.username}!!! your work has been accepted into **${approval.game}**'s source library!

this means it'll help create other assets during development instead of being implemented directly into the game.

*feedback:*
${notes || "none!"}

thanks for helping bring the project to life!!
-# classified as a source asset by ${reviewer}`;
}

function reviewLog(
    message,
    approval,
    files,
    notes,
    reviewer
) {

    return `✨ **hiiiiiiiiii! i found a new approved asset ready for implementation!!**

i grabbed everything i could find to make implementation a little easier!

**developer:**
${message.member?.displayName ?? message.author.username}

**game:**
${approval.game}

**here's what i found:**
${files.length ? files.join("\n") : "erm... i couldn't find any supported files..."}

**feedback:**
${notes || "none!"}

**original message:**
${message.url}

-# originally approved by ${reviewer}`;
}

module.exports = {
    approved,
    needsImprovement,
    implemented,
    sourceAsset,
    reviewLog,
};
