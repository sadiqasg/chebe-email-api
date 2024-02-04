const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

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
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
