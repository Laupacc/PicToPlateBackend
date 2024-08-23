const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');


const USER_ID = process.env.USER_ID;
const APP_ID = process.env.APP_ID;
const PAT = process.env.PAT;
const MODEL_ID = process.env.MODEL_ID;
const MODEL_VERSION_ID = process.env.MODEL_VERSION_ID;

// Route to classify an image using Clarifai API (Object Detection)
router.post('/classifyImage', async (req, res) => {
    const { imageBase64 } = req.body;

    try {
        const raw = JSON.stringify({
            user_app_id: {
                user_id: USER_ID,
                app_id: APP_ID,
            },
            inputs: [
                {
                    data: {
                        image: {
                            base64: imageBase64,
                        },
                    },
                },
            ],
        });

        const requestOptions = {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: "Key " + PAT,
                "Content-Type": "application/json",
            },
            body: raw,
        };

        const result = await fetch(
            `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
            requestOptions
        );

        const resultJson = await result.json();
        console.log("Response from Clarifai:", resultJson);

        const predictions = resultJson.outputs[0].data.concepts;
        res.json(predictions);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
