const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("trust proxy", true);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "chebengwaitlist@gmail.com",
        pass: "klpgpsogojexbsri",
    },
});


// Function to read waitlist from file
const readWaitlistFromFile = () => {
    const filePath = path.join(__dirname, 'waitlist.json');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading waitlist file:', error);
        return [];
    }
};

// Function to write waitlist to file
const writeWaitlistToFile = (waitlist) => {
    const filePath = path.join(__dirname, 'waitlist.json');
    try {
        fs.writeFileSync(filePath, JSON.stringify(waitlist, null, 2));
    } catch (error) {
        console.error('Error writing waitlist file:', error);
    }
};

app.get("/", (req, res) => {
    res.status(200).send("Email API");
});

app.post("/waitlist", async (req, res) => {
    const userEmail = req.body.userEmail;

    const mailOptions = {
        from: "Chebe.ng <chebengwaitlist@gmail.com>",
        to: "chebengwaitlist@gmail.com",
        subject: "New User Added to Waitlist",
        text: `A new user with email ${userEmail} has been added to the waitlist.`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        
        const waitlist = readWaitlistFromFile();
        waitlist.push({ email: userEmail });
        writeWaitlistToFile(waitlist);

        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
});

app.get("/waitlist", (req, res) => {
    const waitlist = readWaitlistFromFile();
    res.json(waitlist);
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
