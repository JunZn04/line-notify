const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const line = require('@line/bot-sdk');

const cors = require('cors');
const express = require('express');
const { middleware: lineMiddleware } = require('@line/bot-sdk');

const { text } = require('body-parser');
const { Server } = require('http');
const { checkPrimeSync } = require('crypto');

require('dotenv').config();

const app = express();
const server = express();
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

// console.log("Channel Access Token:", process.env.CHANNEL_ACCESS_TOKEN);
// console.log("Channel Secret:", process.env.CHANNEL_SECRET);



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


server.post('/webhook', lineMiddleware(lineConfig), (req, res) => {
  // console.log("Received Webhook:", req.body); 

  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((error) => {
        console.error("Error handling events:", error);
        res.status(500).end();
    });
});

function handleEvent(event) {
  // console.log(event);
  // console.log(event.source.userId)
  if ( event.type === 'follow' ){
    const userId = event.source.userId;
    console.log(userId)
    return lineClient.getProfile(userId)
      .then((profile) => {
        const displayName = profile.displayName;
        console.log(`User ${displayName} (${userId}) has added you as a friend!`);

        const message = {
          type: 'text',
          text: `感謝您加我為好友，${displayName}！`
        };

        const Updatesq = "SELECT * From users WHERE line_id = (?)"
        // "UPDATE users SET added = 1 WHERE line_id = (?)"
        console.log(userId)
        
        db.query( Updatesq, userId, ( err, data ) => {
          if (err) throw(err)
            // return res.status(500).json({ status: "Error", message: "System error" });
          console.log("Success: User added friends successfully")
          console.log(data)
          // return res.status(201).json({ status: "Success", message: "User added friends successfully"});
        })

        return lineClient.replyMessage(event.replyToken, message)
      })
      .catch((err) => {
        console.error('Error getting user profile:', err);
      });
  }

  if (event.type === 'message' && event.message.type === 'text'){
    const echo = { type: 'text', text: event.message.text };

    return lineClient.replyMessage(event.replyToken, echo);
  }
  
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
      db.query(insertQuery, values, (err, data) => {
        console.log(data)
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ status: "Error", message: "System error" });
        }

        return res.status(201).json({ status: "Success", message: "User created successfully", userId: data.insertId});
      });
    }
  });
});


app.post('/signin', (req, res) => {

  const sql = "SELECT * FROM users WHERE `email` = (?) AND `password` = (?)"
  const values = [
    req.body.email,
    req.body.password
  ]
  db.query(sql, [values[0], values[1]], (err, data) => {  //查詢登入資訊是否正確
    console.log(data[0].line_id)
    if (err) return res.status(500).json({ status: "Error", message: "System error" });

    if (data.length > 0) {
      if (data[0].line_id === null) {
        return res.status(200).json({
          status: "Success",
          message: "User login successfully, but line_id is null",
          data: data
        });
      } else {
        return res.status(201).json({
          status: "Success",
          message: "User login successfully"
        });
      }
    } else {
      return res.status(400).json({
        status: "Failed",
        message: "User not exist"
      });
    }
  })
})

app.post('/recieve', (req, res) => {
  console.log(req.body)
  const values = [
    req.body.userId,
    req.body.userLineId
  ]  

  const Secletsql = "SELECT * FROM users WHERE id = (?)"
  const Updatesql1 = "UPDATE users SET line_id = (?) WHERE id = (?)"
  const Updatesq2 = "UPDATE users SET added = 1 WHERE  id = (?) AND line_id = (?)"
  const Confirmsql = "SELECT * FROM users WHERE line_id = (?) AND added = 1"
  

  db.query( Secletsql, [ values[0] ], ( err, data ) => {
    if (err) throw(err)
      // return res.status(500).json({ status: "Error", message: "System error" });

    if (data.length > 0) {
      db.query( Updatesql1, [ values[1], values[0] ], ( err, data ) => {
        if (err) throw(err)
          // return res.status(500).json({ status: "Error", message: "System error" });

        db.query( Confirmsql, [ values[1] ], ( err, data ) => {
          if (err)throw(err)
            // return res.status(500).json({ status: "Error", message: "System error" });

          if( data.length > 0){
            db.query( Updatesq2, [ values[0], values[1] ], ( err, data ) => {
              if (err) throw(err)
                // return res.status(500).json({ status: "Error", message: "System error" });
              return res.status(201).json({ status: "Success", message: "Line_id Update successfully and has friend already"})
            })
          }
          else return res.status(200).json({ status: "Success", message: "Line_id Update successfully but has no friend yet"})
          
        })


      })
    } else {
      return res.status(400).json({
        status: "Failed",
        message: "User not exist"
      });
    }
  })

})

// listen on port
const port1 = process.env.PORT || 8080;

app.listen(port1, () => {
  console.log(`Node listening on ${port1}`);
});

const port2 = process.env.PORT || 8081;

server.listen(port2, () => {
  console.log(`Line listening on ${port2}`)
})