const express = require("express");
const router = express.Router();
const AWS = require('aws-sdk');
const { S3 } = require('@aws-sdk/client-s3'); // For AWS SDK v3
require('dotenv').config();



const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new S3({
  region: 'us-west-1', // Specify your region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your access key ID
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your secret access key
  }
});


router.get("/", async (req, res) => {
  try {
    const result = await req.client.query("SELECT * FROM posts");
    res.status(200).json(result);

  }
  catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

const imageUpload = multer({
  storage: multerS3({
    s3: s3,  // Initialize S3 outside of the request
    bucket: 'boxhub_images',
    acl: 'bucket-owner-full-control',
    key: (req, file, cb) => {
      const postId = req.body.postId || 'test';  // Ensure postId exists
      cb(null, `boxhub_images/${postId}-${Date.now()}`);  // Generate unique filename
    },
  }),
  limits: { fileSize: 1024 * 1024 * 5 },  // 5MB limit for testing
});


router.post("/createPost", imageUpload.single("image"), async (req, res) => {
  // 1) insert title into postgresql database, get the postId number

  const title = req.body.title;
  const content = req.body.content;
  const image = req.file;

  const insertResult = await client.query("INSERT INTO posts(title) VALUES ($1) RETURNING id", [title]);
  const postId = insertResult.rows[0].id;

  // 2) Insert the image URL (from S3) into PostgreSQL
  const imageUrl = image.location;  // S3 URL of the uploaded image
  await client.query(
    "UPDATE posts SET image_url = $1 WHERE id = $2",
    [imageUrl, postId]
  );


  // 2) insert article into S3 with the postId number, get the url

  const articleBucketName = "boxhub-articles";

  const articleData = {
    content: content,
    postId: postId,
  }

  const articleParams = {
    Bucket: articleBucketName,
    Key: `${postId}.json`,
    ACL: 'bucket-owner-full-control', // Grants full control to the bucket owner
    Body: JSON.stringify(articleData),
    ContentType: "application/json"
  };

  const articleS3Response = await req.s3.upload(articleParams).promise();

  // 3) insert article url into postgresql database

  await client.query("UPDATE posts SET article_url = $1 WHERE id = $2", [articleS3Response.Location, postId]);

  // 4) get image url

});


// then insert stuff into postgresql database


// GET /users: Retrieve a list of users.
// GET /users/:id: Retrieve a specific user by ID.
// POST /users: Create a new user.
// PUT /users/:id: Update an existing user by ID.
// DELETE /users/:id: Delete a user by ID.

module.exports = router;