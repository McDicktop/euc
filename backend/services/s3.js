const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { randomUUID: v4 } = require("crypto");
const { processImage } = require("./imageProcessor.js");

const { HttpError } = require("../utils/http");

const BUCKET = process.env.S3_BUCKET;
const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    },
    forcePathStyle: true,
});

function ensureConfigured() {
    if(!BUCKET || !process.env.S3_ENDPOINT || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
        throw new HttpError(503, "S3 storage is not configured")
    }
}

const uploadToS3 = async(file, folder = "uploads") => {
    
    ensureConfigured();
    const { buffer, mimetype, ext } = await processImage(file);
    
    const key = `${folder.replace(/^\/+|\/+$/g, "")}/${v4()}${ext}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
        })
    );

    console.log(key)
    // MINIO URL
    return {key, url: `/api/media/${key}`};
}

const listS3Objects = async (prefix = "") => {
    ensureConfigured();

    const res = await s3.send(
        new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: prefix
        })
    );

    return (res.Contents || []).map((obj) => ({
        key: obj.Key,
        url: `${process.env.S3_ENDPOINT}/${BUCKET}/${obj.Key}`,
        size: obj.Size,
        lastModified: obj.LastModified,
    }));
}

const deleteFromS3 = async (key) => {
    ensureConfigured();

    if(!key || !BUCKET) {
        return;
    }

    await s3.send(
        new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key
        })
    )
}

async function getFromS3(key) {
    ensureConfigured();

    return s3.send(new GetObjectCommand({
        Bucket: BUCKET,
        Key: key
    }));
}

module.exports = { uploadToS3, listS3Objects, deleteFromS3, s3, BUCKET };