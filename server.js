const line = require('@line/bot-sdk');
const { text } = require('body-parser');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();


const lineConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

const lineClient = new line.Client(lineConfig);

const app = express();

function getBase64Image(filePath) {
  const bitmap = fs.readFileSync(filePath);
  return Buffer.from(bitmap).toString('base64');
}

const imagePath = path.join(__dirname, '.', 'public','images', '1.jpg'); // 替換為你的本地圖片路徑
const base64Image = getBase64Image(imagePath);

const imageMessage = {
  type: 'image',
  originalContentUrl: `https://i.pinimg.com/564x/04/3a/19/043a198abfc4e47ca2859038bcfac77d.jpg`,
  previewImageUrl: `https://i.pinimg.com/564x/04/3a/19/043a198abfc4e47ca2859038bcfac77d.jpg`
};

// lineClient.pushMessage("Ued478d9a14b1d998ed0c3aaf425a739c",[
//     {
//         "type": "text",
//         "text": "測試發送文字"
//     }
// ])

lineClient.pushMessage("Ued478d9a14b1d998ed0c3aaf425a739c" ,imageMessage)

// register a webhook handler with middleware
// about the middleware, please refer to doc

app.post('/webhook', line.middleware(lineConfig), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // create an echoing text message
  const echo = { type: 'text', text: event.message.text };

  // console.log(event)
  return lineClient.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
