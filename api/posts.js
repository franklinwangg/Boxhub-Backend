import AWS from "aws-sdk";
import { S3 } from "@aws-sdk/client-s3";
import { Client } from "pg";
import formidable from "formidable"; // For file parsing without multer
import fs from "fs";

// Disable Vercel's default bodyParser to handle files
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser for file uploads
  },
};

// Initialize S3 client
const s3 = new S3({
  region: "us-west-1", // Specify your region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Fetch posts from PostgreSQL
    const client = new Client({
      connectionString: process.env.SUPABASE_CONNECTION_STRING_2,
    });

    await client.connect();

    try {
      const result = await client.query("SELECT * FROM posts");
      await client.end();
      return res.status(200).json(result.rows); // Send the posts as JSON
    } catch (error) {
      console.error("Error:", error.message);
      await client.end();
      return res.status(500).send("Server Error");
    }
  }

  if (req.method === "POST") {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Formidable Error:", err);
        return res.status(500).json({ error: "File upload failed" });
      }

      const { title, content } = fields;
      const file = files.image; // Image from the request

      // Validate image file presence
      if (!file) {
        return res.status(400).json({ error: "Image file is required" });
      }

      // Connect to PostgreSQL
      const client = new Client({
        connectionString: process.env.SUPABASE_CONNECTION_STRING_2,
      });
      await client.connect();

      try {
        // 1) Insert title into PostgreSQL and retrieve post ID
        const insertResult = await client.query(
          "INSERT INTO posts(title) VALUES ($1) RETURNING id",
          [title]
        );
        const postId = insertResult.rows[0].id;

        // 2) Upload Image to S3
        const imageStream = fs.createReadStream(file.filepath);
        const imageParams = {
          Bucket: "boxhub_images", // S3 bucket for images
          Key: `boxhub_images/${postId}-${Date.now()}`, // Unique key for the image
          ACL: "bucket-owner-full-control", // Ensure proper access control
          Body: imageStream,
          ContentType: file.mimetype, // Set correct content type for the image
        };
        const imageResponse = await s3.upload(imageParams).promise();
        const imageUrl = imageResponse.Location;

        // 3) Update image URL in PostgreSQL for this post
        await client.query("UPDATE posts SET image_url = $1 WHERE id = $2", [
          imageUrl,
          postId,
        ]);

        // 4) Upload Article to S3 (as JSON)
        const articleData = { content: content, postId: postId };
        const articleParams = {
          Bucket: "boxhub-articles", // S3 bucket for articles
          Key: `${postId}.json`, // Unique key for the article
          ACL: "bucket-owner-full-control", // Ensure proper access control
          Body: JSON.stringify(articleData),
          ContentType: "application/json", // Set correct content type for the article
        };
        const articleResponse = await s3.upload(articleParams).promise();

        // 5) Update article URL in PostgreSQL for this post
        await client.query("UPDATE posts SET article_url = $1 WHERE id = $2", [
          articleResponse.Location,
          postId,
        ]);

        await client.end(); // Close database connection

        return res.status(201).json({
          message: "Post created successfully",
          postId,
          imageUrl,
          articleUrl: articleResponse.Location,
        });
      } catch (error) {
        console.error("Error:", error.message);
        await client.end();
        return res.status(500).json({ error: "Server Error" });
      }
    });
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
