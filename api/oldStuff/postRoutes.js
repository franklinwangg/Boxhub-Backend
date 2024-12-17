import AWS from "aws-sdk";
import { S3 } from "@aws-sdk/client-s3";
import { Client } from "pg";
import formidable from "formidable"; // For file parsing without multer
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};

const s3 = new S3({
  region: "us-west-1", // Specify your region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    const client = new Client({
      connectionString: process.env.SUPABASE_CONNECTION_STRING_2,
    });

    await client.connect();

    try {
      const result = await client.query("SELECT * FROM posts");
      await client.end();
      return res.status(200).json(result.rows);
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
      const file = files.image;

      if (!file) {
        return res.status(400).json({ error: "Image file is required" });
      }

      // Connect to PostgreSQL
      const client = new Client({
        connectionString: process.env.SUPABASE_CONNECTION_STRING_2,
      });
      await client.connect();

      try {
        // 1) Insert title into PostgreSQL
        const insertResult = await client.query(
          "INSERT INTO posts(title) VALUES ($1) RETURNING id",
          [title]
        );
        const postId = insertResult.rows[0].id;

        // 2) Upload Image to S3
        const imageStream = fs.createReadStream(file.filepath);
        const imageParams = {
          Bucket: "boxhub_images",
          Key: `boxhub_images/${postId}-${Date.now()}`,
          ACL: "bucket-owner-full-control",
          Body: imageStream,
          ContentType: file.mimetype,
        };
        const imageResponse = await s3.upload(imageParams).promise();
        const imageUrl = imageResponse.Location;

        // 3) Update image URL in PostgreSQL
        await client.query("UPDATE posts SET image_url = $1 WHERE id = $2", [
          imageUrl,
          postId,
        ]);

        // 4) Upload article to S3
        const articleData = { content: content, postId: postId };
        const articleParams = {
          Bucket: "boxhub-articles",
          Key: `${postId}.json`,
          ACL: "bucket-owner-full-control",
          Body: JSON.stringify(articleData),
          ContentType: "application/json",
        };
        const articleResponse = await s3.upload(articleParams).promise();

        // 5) Update article URL in PostgreSQL
        await client.query("UPDATE posts SET article_url = $1 WHERE id = $2", [
          articleResponse.Location,
          postId,
        ]);

        await client.end();

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











// const express = require("express");
// const router = express.Router();
// const AWS = require('aws-sdk');
// const { S3 } = require('@aws-sdk/client-s3'); // For AWS SDK v3
// require('dotenv').config();



// const multer = require('multer');
// const multerS3 = require('multer-s3');

// const s3 = new S3({
//   region: 'us-west-1', // Specify your region
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your access key ID
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your secret access key
//   }
// });


// router.get("/", async (req, res) => {
//   try {
//     const result = await req.client.query("SELECT * FROM posts");
//     res.status(200).json(result);

//   }
//   catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server Error");
//   }
// });

// const imageUpload = multer({
//   storage: multerS3({
//     s3: s3,  // Initialize S3 outside of the request
//     bucket: 'boxhub_images',
//     acl: 'bucket-owner-full-control',
//     key: (req, file, cb) => {
//       const postId = req.body.postId || 'test';  // Ensure postId exists
//       cb(null, `boxhub_images/${postId}-${Date.now()}`);  // Generate unique filename
//     },
//   }),
//   limits: { fileSize: 1024 * 1024 * 5 },  // 5MB limit for testing
// });


// router.post("/createPost", imageUpload.single("image"), async (req, res) => {
//   // 1) insert title into postgresql database, get the postId number

//   const title = req.body.title;
//   const content = req.body.content;
//   const image = req.file;

//   const insertResult = await client.query("INSERT INTO posts(title) VALUES ($1) RETURNING id", [title]);
//   const postId = insertResult.rows[0].id;

//   // 2) Insert the image URL (from S3) into PostgreSQL
//   const imageUrl = image.location;  // S3 URL of the uploaded image
//   await client.query(
//     "UPDATE posts SET image_url = $1 WHERE id = $2",
//     [imageUrl, postId]
//   );


//   // 2) insert article into S3 with the postId number, get the url

//   const articleBucketName = "boxhub-articles";

//   const articleData = {
//     content: content,
//     postId: postId,
//   }

//   const articleParams = {
//     Bucket: articleBucketName,
//     Key: `${postId}.json`,
//     ACL: 'bucket-owner-full-control', // Grants full control to the bucket owner
//     Body: JSON.stringify(articleData),
//     ContentType: "application/json"
//   };

//   const articleS3Response = await req.s3.upload(articleParams).promise();

//   // 3) insert article url into postgresql database

//   await client.query("UPDATE posts SET article_url = $1 WHERE id = $2", [articleS3Response.Location, postId]);

//   // 4) get image url

// });


// // then insert stuff into postgresql database


// // GET /users: Retrieve a list of users.
// // GET /users/:id: Retrieve a specific user by ID.
// // POST /users: Create a new user.
// // PUT /users/:id: Update an existing user by ID.
// // DELETE /users/:id: Delete a user by ID.

// module.exports = router;