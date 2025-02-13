require("dotenv").config({path:"../.env"});
const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const api = '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'

router.post("/", async (req, res) => {
    try {
        const { text } = req.body;
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/distilbert-base-uncased",
            { inputs: text },
            {
                headers: {
                    Authorization: `Bearer ${api}`,
                },
            }
        );
        res.json(response.data);
    } catch (error) {   
        res.status(500).json({ error: "Failed to process request" });
    }
});

router.post("/hf-extract-entities", async (req, res) => {
    try {
        const { text } = req.body;
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/dbmdz/bert-large-cased-finetuned-conll03-english",
            { inputs: text },
            {
                headers: {
                    Authorization: `Bearer ${api}`,
                },  
            }
        );  
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to process request" });
    }
});


module.exports = router;