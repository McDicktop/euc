const Router = require("express");
const router = new Router();
const { s3, BUCKET } = require("../utils/s3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

router.get("/{*key}", async (req, res) => {
    const rawKey = req.params.key;

    const key = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;

    try {
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
        const { Body, ContentType } = await s3.send(command);

        res.setHeader(
            "Content-Type",
            ContentType ?? "application/octet-stream",
        );
        res.setHeader("Cache-Control", "public, max-age=31536000");

        if (Body instanceof require("stream").Readable) {
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
        res.status(404).json({ message: "Not found" });
    }
});

module.exports = router;
