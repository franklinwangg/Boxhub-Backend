const { S3, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Client } = require("pg");
const multer = require("multer");

require("dotenv").config();

const s3 = new S3({
    region: "us-west-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const client = new Client({
    connectionString: process.env.SUPABASE_CONNECTION_STRING_2,
    ssl: { rejectUnauthorized: false },
});

client.connect();

const imageUpload = multer({ storage: multer.memoryStorage() });

module.exports = async (req, res) => {
    try {
        const { postId } = req.body;
        const image = req.file;

        // Upload image to S3 bucket
        const params = {
            Bucket: "boxhub-images",
            Key: `${postId}`,
            Body: image.buffer,
            ACL: "bucket-owner-full-control",
            ContentType: image.mimetype,
        };

        await s3.send(new PutObjectCommand(params));

        const imageUrl = `https://boxhub-images.s3.us-west-1.amazonaws.com/${postId}`;
        await client.query("UPDATE posts SET image_url = $1 WHERE id = $2", [
            imageUrl,
            postId,
        ]);

        res.status(200).json({ success: true, imageUrl });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false });
    }
};
