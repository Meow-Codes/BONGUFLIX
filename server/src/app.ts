import express from "express";

const app = express();
const PORT = 6942;

app.get("/", (req, res) => {
    res.send("Yep BONGUFLIX Backend is working fine!!!")
});

app.listen(PORT || 6942, () => {
    console.log(`Server is running on port ${PORT}`);
});