const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { Pool } = require("pg");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("trust proxy", true);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

pool.connect((err, client, done) => {
    if (err) {
        console.error("Error connecting to the database", err);
    } else {
        console.log("Connected to the database");
    }
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

app.get("/", (req, res) => {
    res.status(200).send("Email API");
});

app.post("/waitlist", async (req, res) => {
    const userEmail = req.body.userEmail;

    const mailOptions = {
        from: "Chebe.ng <chebengwaitlist@gmail.com>",
        to: process.env.MAIL_TO,
        subject: "New User Added to Waitlist",
        text: `A new user with email ${userEmail} has been added to the waitlist.`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        await pool.query("INSERT INTO waitlist (email) VALUES ($1)", [
            userEmail,
        ]);
        res.status(201).json({
            message: "Email added to waitlist",
            response: info.response,
        });
    } catch (error) {
        console.error("Error sending email:", error.message, error.stack);
        res.status(400).json(error);
    }
});

app.get("/waitlist", async (req, res) => {
    const result = await pool.query("SELECT email FROM waitlist");
    const waitlist = result.rows.map((row) => ({ email: row.email }));
    res.json(waitlist);
});

app.get("/waitlist/delete/all", async (req, res) => {
    try {
        await pool.query("DELETE FROM waitlist");
        res.status(204).json({ message: "All emails cleared" });
    } catch (error) {
        console.error("Error deleting waitlist:", error);
        res.status(500).json({ error: "Failed to delete waitlist" });
    }
});

app.get("/waitlist/delete/:email", async (req, res) => {
    const emailToDelete = req.params.email;

    try {
        await pool.query("DELETE FROM waitlist WHERE email = $1", [
            emailToDelete,
        ]);
        res.status(200).json({ message: `Email ${emailToDelete} deleted` });
    } catch (error) {
        console.error(`Error deleting email ${emailToDelete}:`, error);
        res.status(500).json({ error: "Failed to delete email" });
    }
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
