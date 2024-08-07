const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const line = require('@line/bot-sdk');

const cors = require('cors');
const express = require('express');

const { text } = require('body-parser');

require('dotenv').config();

const app = express();
app.use(cors())
app.use(express.json());

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'QhrSJjj%5%Q',
  database: 'line_notify',
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});


const lineConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

const lineClient = new line.Client(lineConfig);


const imageMessage = {
  type: 'image',
  originalContentUrl: `https://i.pinimg.com/564x/04/3a/19/043a198abfc4e47ca2859038bcfac77d.jpg`,
  previewImageUrl: `https://i.pinimg.com/564x/04/3a/19/043a198abfc4e47ca2859038bcfac77d.jpg`
};

function ErrMes(Status="Error", Message=null, Else=null){
  let structure = {
      "Status" : Status,
      "Message" : Message,
      "Error" : Else
  }
  return structure
}

// lineClient.pushMessage("Ued478d9a14b1d998ed0c3aaf425a739c" ,imageMessage)

// lineClient.pushMessage("Ued478d9a14b1d998ed0c3aaf425a739c",[
//     {
//         "type": "text",
//         "text": "測試發送文字"
//     }
// ])



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

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // create an echoing text message
  const echo = { type: 'text', text: event.message.text };

  // console.log(event)
  return lineClient.replyMessage(event.replyToken, echo);
}

app.post('/signup', (req, res) => {
  const confirmQuery = "SELECT * FROM users WHERE email = ?";
  const insertQuery = "INSERT INTO users (email, fname, lname, password) VALUES (?, ?, ?, ?)";

  const values = [
    req.body.email,
    req.body.fname,
    req.body.lname,
    req.body.password
  ];

  // 檢查是否已經存在相同的 email
  db.query(confirmQuery, [req.body.email], (err, confirmData) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ status: "Error", message: "System error" });
    }

    if (confirmData.length > 0) {
      // 如果 email 已經存在
      return res.status(400).json({ status: "Failed", message: "Email already exists" });
    } else {
      // 插入新的使用者
      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ status: "Error", message: "System error" });
        }

        return res.status(201).json({ status: "Success", message: "User created successfully" });
      });
    }
  });
});


app.post('/signin', (req, res) => {
  console.log("signin")
  const sql = "SELECT * FROM users WHERE `email` = (?) AND `password` = (?)"
  const values = [
    req.body.email,
    req.body.password
  ]
  db.query(sql, [values[0], values[1]], (err, data) => {   //查詢登入資訊是否正確
    if (err) return res.json(API_ARCHITHCTURE());

    if (data.length > 0) {
      return res.status(201).json({ status: "Success", message: "User login successfully" })
    }
    else
      return res.status(400).json({ status: "Failed", message: "User not exist" });
  })
})

// listen on port
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
