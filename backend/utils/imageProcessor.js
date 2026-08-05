const sharp = require("sharp");

const MAX_DIMENTIONS = 1080;

const processImage = async (file) => {
    const image = sharp(file.buffer, {failOn: "none"});
    const metadata = await image.metadata();

    const needsResize = 
        (metadata.width && metadata.width > MAX_DIMENTIONS) ||
        (metadata.height && metadata.height > MAX_DIMENTIONS);

    let pipiline = image.rotate(); // EXIF авто поворот

    if(needsResize) {
        pipiline = pipiline.resize({
            width: MAX_DIMENTIONS,
            height: MAX_DIMENTIONS,
            fit: "inside",
            withoutEnlargement: true
        })
    }

    let buffer, mimetype, ext;

    switch(file.mimetype) {
        case "image/png":
            buffer = await pipiline.png({quality: 100, compressionLevel: 9}).toBuffer();
            mimetype = "image/png";
            ext = ".png";
        case "image/webp":
            buffer = await pipiline.webp({quality: 100}).toBuffer();
            mimetype = "image/webp";
            ext = ".webp";
        case "image/jpeg":
            buffer = await pipiline.jpeg({quality: 100}).toBuffer();
            mimetype = "image/jpeg";
            ext = ".jpg";
    }

    return {buffer, mimetype, ext}
}

module.exports = {processImage}