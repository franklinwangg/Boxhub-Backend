const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const commentRoutes = require("./routes/commentRoutes");
// const postRoutes = require("./routes/postRoutes");
const { Client } = require("pg");
const AWS = require('aws-sdk');
const { S3, PutObjectCommand } = require('@aws-sdk/client-s3'); // For AWS SDK v3
require('dotenv').config();  // Add this at the top of the file

const multer = require('multer');
const multerS3 = require('multer-s3');

const PORT = process.env.PORT || 5000;

let imageUpload = multer({ storage: multer.memoryStorage() });

const s3 = new S3({
    region: 'us-west-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const app = express();
let postIdVar = 0;
let titleVar = "";

app.use(express.json());

// CORS configuration to whitelist your client
const corsOptions = {
    origin: 'http://localhost:3000', 
    methods: ['GET,POST,PUT,DELETE'],  
    credentials: true               
};

// Using the connection string directly
const client = new Client({
    connectionString: process.env.SUPABASE_CONNECTION_STRING_2,
    ssl: { rejectUnauthorized: false },
});

// Connect to the database
client.connect()
    .then(() => console.log('Connected to the Supabase database'))
    .catch(err => console.error('Connection error', err.stack));


app.use(cors(corsOptions));  // Apply CORS options


app.use((req, res, next) => {
    req.client = client;
    req.s3 = s3;
    next();
});

app.use("/api/users", userRoutes);

app.use("/api/comments", commentRoutes);


app.post("/api/posts/createPostTitleAndContent", async (req, res) => {

    try {
        const title = req.body.title;
        const content = req.body.content;

        // 1) insert title into postgreSQL table
        const insertResult = await client.query("INSERT INTO posts(title) VALUES ($1) RETURNING id", [title]); // 209, 143
        postId = insertResult.rows[0].id;
        postIdVar = postId;
        titleVar = title;


        // 2) initialize imageUpload with postId name
        imageUpload = multer({
            storage: multerS3({
                s3: s3,  
                bucket: 'boxhub-images',
                acl: 'bucket-owner-full-control',
                key: (req, file, cb) => {
                    const postId = req.body.postId || 'test';  
                    cb(null, `${postId}`);  
                },
            }),
            limits: { fileSize: 1024 * 1024 * 5 },  // 5MB limit for testing
        });

        // 3) insert content into boxhub-articles table
        const articleData = {
            content: content,
            postId: postId,
        }


        const articleParams = {
            Bucket: "boxhub-articles",
            Key: `${postId}.json`,
            ACL: 'bucket-owner-full-control', 
            Body: JSON.stringify(articleData),
            ContentType: "application/json"
        };

        const articleS3Response = await s3.send(new PutObjectCommand(articleParams));

        // 4) post url to postgres table
        const articleUrl = `https://boxhub-articles.s3.us-west-1.amazonaws.com/${postId}.json`;

        await client.query("UPDATE posts SET article_url = $1 WHERE title = $2", [articleUrl, title]);
        res.status(200).json({ success: true });

    }
    catch (error) {

        console.log("Error : ", error);
        res.status(500).json({ success: false });

    }
});

app.post("/api/posts/createPostImage", imageUpload.single("image"), async (req, res) => {
    // 4) image should already be uploaded, now just insert image url onto postgresql table

    try {

        const image = req.file;

        await s3.send(new PutObjectCommand({
            Bucket: "boxhub-images",
            Key: `${postIdVar}`,  // Use postId as the key (filename)
            Body: req.file.buffer,    // Use the buffer from req.file
            ACL: 'bucket-owner-full-control',
            ContentType: req.file.mimetype,
        }));

        const image_url = `https://boxhub-images.s3.us-west-1.amazonaws.com/${postIdVar}`;
        await client.query("UPDATE posts SET image_url = $1 WHERE title = $2", [image_url, titleVar]); // here

        res.status(200).json({ success: true });
    }
    catch (error) {
        console.log("Error : ", error);
    }

});


// postRoutes stuff 
app.get("/api/posts/", async (req, res) => {
    try {
        const result = await req.client.query("SELECT * FROM posts");
        res.status(200).json(result);

    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


exports.handler = async (event) => {
    // Connect to the database

    try {
        // Example query: Select from a table
        const res = await client.query('SELECT * FROM your_table');

        // Return the query results
        return {
            statusCode: 200,
            body: JSON.stringify(res.rows),
        };
    } catch (err) {
        // Handle errors
        console.error('Error executing query', err.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Database query failed' }),
        };
    } finally {
        // Close the database connection
        await client.end();
    }
};

