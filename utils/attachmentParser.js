const supportedExtensions = [
    ".rbxm",
    ".rbxl",
    ".obj",
    ".fbx",
    ".wav",
    ".mp3",
    ".ogg",
    ".flac",
    ".m4a",
    ".txt",
];

function parseAttachments(attachments) {

    const files = [];

    for (const attachment of attachments) {

        if (
            supportedExtensions.some(ext =>
                attachment.name.toLowerCase().endsWith(ext)
            )
        ) {
            files.push(`• ${attachment.name}`);
        }

    }

    return files;

}

module.exports = parseAttachments;