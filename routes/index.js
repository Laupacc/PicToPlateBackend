var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

const USER_ID = process.env.USER_ID;
const APP_ID = process.env.APP_ID;
const PAT = process.env.PAT;
const MODEL_ID = process.env.MODEL_ID;
const MODEL_VERSION_ID = process.env.MODEL_VERSION_ID;

router.post('/classifyImage', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

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
        Authorization: `Key ${PAT}`,
        "Content-Type": "application/json",
      },
      body: raw,
    };

    const result = await fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`, requestOptions);
    const resultJson = await result.json();

    res.json(resultJson);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error classifying image');
  }
});

module.exports = router;
