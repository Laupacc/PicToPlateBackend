const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');


const USER_ID = process.env.USER_ID;
const APP_ID = process.env.APP_ID;
const PAT = process.env.PAT;
const MODEL_ID = process.env.MODEL_ID;
const MODEL_VERSION_ID = process.env.MODEL_VERSION_ID;
const IBM_API_URL = process.env.IBM_API_URL
const IBM_API_KEY = process.env.IBM_API_KEY

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

// Route to transcribe an audio file using IBM Watson API (Speech to Text)
router.post('/transcribeAudio', async (req, res) => {
    const { audioBase64 } = req.body;

    if (!audioBase64) {
        return res.status(400).json({ error: 'No audio data provided' });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');

    try {
        const response = await fetch(`https://api.eu-gb.speech-to-text.watson.cloud.ibm.com/instances/${IBM_API_URL}/v1/recognize`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from('apikey:' + IBM_API_KEY).toString('base64')}`,
                'Content-Type': 'audio/wav',
            },
            body: audioBuffer
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error from Watson:', errorText);
            return res.status(response.status).send(errorText);
        }

        const data = await response.json();
        console.log('Watson API Response:', data);

        if (data.results && data.results.length > 0) {
            const transcription = data.results[0].alternatives[0].transcript;
            console.log('Transcription:', transcription);
            res.json(transcription);
        } else {
            console.log('No transcription results found');
            res.status(404).json('No transcription results found');
        }

    } catch (error) {
        console.log('Error during transcription:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;
