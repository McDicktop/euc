const path = require("path");
const { Readable } = require("stream");

const Router = require("express");
const router = new Router();

const { s3, BUCKET, listS3Objects } = require("../utils/s3.js");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { requireAuth } = require("../middlewares/requireAuth.js");

router.get("/files", requireAuth, async (req, res) => {
    
    try {
        const prefix = req.query.prefix;

        if (prefix !== undefined && typeof prefix !== "string") {
            return res.status(400).json({
                message: "Invalid prefix parameter. Must be a string",
                error: "INVALID_PREFIX",
            });
        }

        const files = await listS3Objects(prefix ?? "");
        return res.status(200).json({ files });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/files/:id", requireAuth, async (req, res) => {
    
    const { id } = req.params;

    try {
        const files = await listS3Objects();
        const match = files.find((file) => path.basename(file.key, path.extname(file.key)) === id);

        if(!match) {
            return res.status(404).json({
                message: "Photo not found",
                error: "NOT_FOUND",
            });
        }
        
        return res.status(200).json(match);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/{*key}", async (req, res) => {
    const rawKey = req.params.key;

    // /cache/image/avatars/1.png

    // /cache
    // /image
    // /avatars
    // /1.png

    const key = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;

    try {
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
        const { Body, ContentType } = await s3.send(command);

        res.setHeader(
            "Content-Type",
            ContentType ?? "application/octet-stream",
        );
        res.setHeader("Cache-Control", "public, max-age=31536000");

        if (Body instanceof Readable) {
            Body.pipe(res);
        } else {
            const chunks = [];
            for await (const chunk of Body) {
                chunks.push(chunk);
            }
            res.end(Buffer.concat(chunks));
        }
    } catch (e) {
        console.log(e);
        res.status(404).json({ message: "File not found" });
    }
});

module.exports = router;
