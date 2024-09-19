const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const axios = require('axios'); 
const line = require('@line/bot-sdk');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');

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
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')));
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8082 });

const clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);
  console.log('Client connected');

  // 當客戶端斷開連接時，從數組中移除該實例
  ws.on('close', () => {
    console.log('Client closed')
    const index = clients.indexOf(ws);
    if (index > -1) {
      clients.splice(index, 1);
    }
  });
});

function sendNotificationToAllClients(message, data) {
  setTimeout(() => {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        // 將 message 和 data 包裝成一個對象發送
        client.send(JSON.stringify({ message, data }));
      }
    });
  }, 5000);
}

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
  if (event.type === 'follow') {
    const LineId = event.source.userId;
  
    axios.get(`https://api.line.me/v2/bot/profile/${LineId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
      }
    })
    .then(response => {
      const userProfile = response.data;
      const userName = userProfile.displayName; // 獲取用戶的名字
    
      console.log(`User ${userName} has followed!`);
  
      // 数据库更新逻辑，放在 axios 请求之后，确保获取到 userName
      const Updatesql = "UPDATE users SET added = 1 WHERE line_id = (?)";
      db.query(Updatesql, [LineId], (err, data) => {
        if (err) throw err;
  
        console.log(data.info);
        if (data.changedRows > 0) {
          const SelectSql = "SELECT * FROM users WHERE line_id = ?";
          db.query(SelectSql, [LineId], (err, updatedData) => {
            if (err) throw err;
  
            // 显示更新后的行数据
            const userId = updatedData[0].id;
            sendNotificationToAllClients(`User ${userId} has added friend`, userId);
          });
        } else {
          // 没有行被更新，可能条件不符合
          console.log("No rows were updated.");
        }
      });
  
      // 发送感谢消息，获取到 userName 后
      const messages = {
        type: 'text',
        text: `感謝${userName}成為我的好友！如果有任何問題，隨時告訴我哦！😊`
      };
  
      // 回复消息给 LINE 用户
      return lineClient.replyMessage(event.replyToken, messages);
    })
    .catch(error => {
      console.error('Error getting profile or sending message:', error.response ? error.response.data : error.message);
    });
  }
  
  if (event.type === 'message' && event.message.type === 'text'){
    const echo = { type: 'text', text: event.message.text };

    return lineClient.replyMessage(event.replyToken, echo);
  }
  
}

// function handleFollow(event) {
//   const userId = event.source.userId;
//   console.log('User ID from Event:', userId); // 添加調試輸出

//   const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.LINE_LOGIN_ID}&redirect_uri=${process.env.LINE_REDIRECT_URI}&scope=openid%20profile&state=${userId}&nonce=abcdefg&bot_prompt=aggressive`;

//   const message = {
//     type: 'template',
//     altText: '歡迎！請點擊以下按鈕登入',
//     template: {
//       type: 'buttons',
//       text: '歡迎加好友！點擊下方按鈕登入。',
//       actions: [
//         {
//           type: 'uri',
//           label: '登入',
//           uri: loginUrl
//         }
//       ]
//     }
//   };

//   return lineClient.replyMessage(event.replyToken, message);
// }

app.get('/callback', async (req, res) => {
  // 從請求的 URL 查詢參數中獲取授權碼
  const authorizationCode = req.query.code;
  const userId = req.query.state;

  if (authorizationCode) {
    try {
      // 使用授權碼交換 access token

      const options = querystring.stringify({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: process.env.LINE_REDIRECT_URI,
        client_id: process.env.LINE_LOGIN_ID,
        client_secret: process.env.LINE_CLIENT_SECRET,
      });

      const response = await axios.post('https://api.line.me/oauth2/v2.1/token', options, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const accessToken = response.data.access_token;
      const idToken = response.data.id_token; // 如果需要
      const decodedToken = jwt.decode(idToken);
      const userIdFromToken = decodedToken.sub;

      const Profile = await getLineProfile(accessToken)
      const LineId = Profile.userId

      const Secletsql = "SELECT * FROM users WHERE id = (?)"
      const Updatesql1 = "UPDATE users SET line_id = (?) WHERE id = (?)"
      const Updatesq2 = "UPDATE users SET added = 1 WHERE  id = (?) AND line_id = (?)"
      const Confirmsql = "SELECT * FROM users WHERE line_id = (?) AND added = 1"
    
      db.query( Secletsql, [userId], ( err, data ) => {
        if (err) throw(err)
          // return res.status(500).json({ status: "Error", message: "System error" });

        if (data.length > 0) {
          db.query( Updatesql1, [ LineId, userId ], ( err, data ) => {
            if (err) throw(err)
              // return res.status(500).json({ status: "Error", message: "System error" });
    
            db.query( Confirmsql, [ LineId ], ( err, data ) => {
              if (err)throw(err)
                // return res.status(500).json({ status: "Error", message: "System error" });
    
              if( data.length > 0){
                db.query( Updatesq2, [ userId, LineId ], ( err, data ) => {
                  if (err) throw(err)
                    // return res.status(500).json({ status: "Error", message: "System error" });
                  // return res.status(201).json({ status: "Success", message: "Line_id Update successfully and has friend already"})
                  console.log("Line_id Update successfully and has friend already")
                  sendNotificationToAllClients("Line_id Update successfully and has friend already",userId)
                })
              }
              else console.log("Line_id Update successfully but has no friend yet")
              //sendNotificationToAllClients("Line_id Update successfully but has no friend yet",userId)
              
              //return res.status(200).json({ status: "Success", message: "Line_id Update successfully but has no friend yet"})
              
            })
    
    
          })
        } else {
          console.log("User not exist")
          // return res.status(400).json({
          //   status: "Failed",
          //   message: "User not exist"
          // });
        }
      })
      // console.log(`getLine Profile ${Profile}`)
      // console.log('Line Profile:', Profile); // 打印整个对象
      // console.log('Formatted Line Profile:', JSON.stringify(Profile, null, 2)); // 格式化后的对象
      // console.log('User ID:', Profile.userId); // 访问具体属性
      // console.log('Display Name:', Profile.displayName); // 访问具体属性
      
      // 回應給用戶
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Success</title>
            <link rel="stylesheet" href="/styles/styles.css">
          </head>
          <body>
            <div class="container">
              <div class="profile-picture-container">
                <img class="profile-picture" src="${Profile.pictureUrl}" alt="Profile Picture">
              </div>
              <h1>Login Successful!</h1>
              <p>Thanks ${Profile.displayName} for using our service!</p>
              <p>It will turn to the main page in three seconds</p>
            </div>
            <script>
              window.setTimeout(() => {
                window.location.href = 'http://localhost:3000/recieve';
              }, 3000); // 3秒后自动跳转
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error exchanging authorization code for access token:', error.response ? error.response.data : error.message);
      res.status(500).send('Error processing authorization code.');
    }
  } else {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login Failed</title>
      </head>
      <body>
        <h1>Login Failed</h1>
        <p>No authorization code found.</p>
        <script>
          // 自動關閉頁面
          window.setTimeout(() => {
            window.close();
          }, 3000); // 3秒後自動關閉
        </script>
      </body>
      </html>
    `);
  }
});


app.post('/signup', (req, res) => {
  const confirmQuery = "SELECT * FROM users WHERE email = ?";
  const insertQuery = "INSERT INTO users (email, fname, lname, password) VALUES (?, ?, ?, ?)";

  const values = [
    req.body.email,
    req.body.fname,
    req.body.lname,
    req.body.password
  ];

  const decodedToken = jwt.decode(values[3]);
  // console.log(`decodedToken: ${decodedToken}`)

  // 檢查是否已經存在相同的 email
  db.query(confirmQuery, [req.body.email], (err, confirmData) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ status: "Error", message: "System error" });
    }

    if (confirmData.length > 0) { 
      // console.log(confirmData)
      return res.status(200).json({ status: "Success", message: "Email already exists" });
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
   
})


async function getLineProfile(accessToken) {
  try {
      const response = await axios.get('https://api.line.me/v2/profile', {
          headers: {
              Authorization: `Bearer ${accessToken}`
          }
      });

      // 返回用户的 Line Profile
      //console.log(response.data)
      return response.data;
  } catch (error) {
      console.error('Error fetching Line profile:', error.response ? error.response.data : error.message);
      throw error;
  }
}

// listen on port
const port1 = process.env.PORT || 8080;

app.listen(port1, () => {
  console.log(`Node listening on ${port1}`);
});

const port2 = process.env.PORT || 8081;

server.listen(port2, () => {
  console.log(`Line listening on ${port2}`)
});