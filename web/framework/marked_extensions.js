const subtextLink = {
    name: 'subtextLink',
    level: 'inline',
    tokenizer(src) {
        const match = /^\[(.*)\]\[(.*)\]\((.*)\)/.exec(src);
        if (match) {
            const [, buttonText, buttonSubText, url] = match;
            return {
                type: 'subtextLink',
                raw: match[0],
                buttonText: buttonText.trim(),
                buttonSubText: buttonSubText.trim(),
                url: url.trim()
            };
        }
    },
    renderer(token) {
        return `<a class="subtexted-link" href="${token.url}">
                    <span class="link-text">(${token.buttonText})</span>
                    <span class="text-translated">${token.buttonSubText}</span>
                </a>`;
    }
};

const imageLink = {
    name: 'imageLink',
    level: 'inline',
    tokenizer(src) {
        const match = /^!\[(.*)\]\((.*)\)\((.*)\)/.exec(src);
        if (match) {
            const [, imageAltText, url, imageUrl] = match;
            return {
                type: 'imageLink',
                raw: match[0],
                imageAltText: imageAltText.trim(),
                imageUrl: imageUrl.trim(),
                url: url.trim()
            };
        }
    },
    renderer(token) {
        return `<a class="image-link" href="${token.url}">
                    <img alt="${token.imageAltText}" src="${token.imageUrl}">
                </a>`;
    }
};

const sizeableImageLink = {
    name: 'sizeableImageLink',
    level: 'inline',
    tokenizer(src) {
        const match = /^!\[(.*)\|([0-9]+)\]\((.*)\)\((.*)\)/.exec(src);
        if (match) {
            const [, imageAltText, size, url, imageUrl] = match;
            return {
                type: 'sizeableImageLink',
                raw: match[0],
                imageAltText: imageAltText.trim(),
                imageUrl: imageUrl.trim(),
                size: size.trim() + "%",
                url: url.trim()
            };
        }
    },
    renderer(token) {
        return `<a class="image-link" href="${token.url}">
                    <img alt="${token.imageAltText}" src="${token.imageUrl}" style="width: ${token.size}">
                </a>`;
    }
};

const sizeableImage = {
    name: 'sizeableImage',
    level: 'inline',
    tokenizer(src) {
        const match = /^!\[(.*)\|([0-9]+)\]\((.*)\)/.exec(src);
        if (match) {
            const [, imageAltText, size, imageUrl] = match;
            return {
                type: 'sizeableImage',
                raw: match[0],
                imageAltText: imageAltText.trim(),
                imageUrl: imageUrl.trim(),
                size: size.trim() + "%",
            };
        }
    },
    renderer(token) {
        return `<img alt="${token.imageAltText}" src="${token.imageUrl}" style="width: ${token.size}">`;
    }
};

marked.use({ extensions: [subtextLink, imageLink, sizeableImage, sizeableImageLink] });
