const { Client } = require("pg"); // Import the Postgres Client
const bcrypt = require('bcryptjs');

require("dotenv").config();

module.exports = async(req, res) => {
    if(req.method == "POST") {
        if(req.query.action == "login") {
            try {
                const { username, password } = req.body;

                const client = new Client({connectionString : 
                    process.env.SUPABASE_CONNECTION_STRING_2,
                });
                await client.connect();
        
                const result = await client.query
                    ("SELECT * FROM users WHERE username = $1", [username]);
        
        
                await client.end();
                if (result.rows.length === 0) { 
                    return res.status(404).send("User not found");
                }
        
                const isMatch = await bcrypt.compare(password, result.rows[0].password_hash);
                if (isMatch) {
                    res.status(200).json({ success : true, message: "Login successful" });
                }
                else {
                    return res.status(401).json({ message: "Invalid credentials" });
                }
            }
            catch (error) {
                console.error(error.message);
                res.status(500).send("Server Error");
            }
        }
        else {
            try {
                const { username, password } = req.body;
        
                const client = new Client({connectionString : 
                    process.env.SUPABASE_CONNECTION_STRING_2,
                });
                await client.connect();

                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
        
                const result = await client.query
                    ("INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *", [username, hashedPassword]);
        
                await client.end();

                res.json(result);
            }
            catch (error) {
                console.error(error.message);
                res.status(500).send("Server Error");
            }
        }
    }
};


// const express = require("express");
// const router = express.Router();
// const bcrypt = require('bcryptjs');


// router.post("/login", async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         const result = await req.client.query
//             ("SELECT * FROM users WHERE username = $1", [username]);


//         if (result.rows.length === 0) { 
//             return res.status(404).send("User not found");
//         }

//         const isMatch = await bcrypt.compare(password, result.rows[0].password_hash);
//         if (isMatch) {
//             res.status(200).json({ success : true, message: "Login successful" });
//         }
//         else {
//             return res.status(401).json({ message: "Invalid credentials" });
//         }
//     }
//     catch (error) {
//         console.error(error.message);
//         res.status(500).send("Server Error");
//     }
// });

// // register
// router.post("/", async (req, res) => {
//     // create new user
//     try {
//         const { username, password } = req.body;

//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(password, saltRounds);

//         const result = await req.client.query
//             ("INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *", [username, hashedPassword]);

//         res.json(result);
//     }
//     catch (error) {
//         console.error(error.message);
//         res.status(500).send("Server Error");
//     }

// });




// // GET /users: Retrieve a list of users.
// // GET /users/:id: Retrieve a specific user by ID.
// // POST /users: Create a new user.
// // PUT /users/:id: Update an existing user by ID.
// // DELETE /users/:id: Delete a user by ID.

// module.exports = router;