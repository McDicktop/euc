const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { v4 } = require("uuid");
const path = require("path");

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    },
    forcePathStyle: true,
});



const BUCKET = process.env.S3_BUCKET;

const uploadToS3 = async(file, folder = "uploads") => {
    const ext = path.extname(file.originalname); // ext = ".jpg"  (например)
    const key = `${folder}/${v4()}${ext}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        })
    );

    // MINIO URL
    return `/api/media/${key}`;
}

const listS3Objects = async (prefix = "") => {
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
    await s3.send(
        new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key
        })
    )
}

module.exports = { uploadToS3, listS3Objects, deleteFromS3, s3, BUCKET };