import React, { useEffect, useState, Fragment } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import styles from './ReceivePage.module.css'; // 引入CSS模塊
import axios from 'axios';
import qs from 'qs';

function Recieve() {
    const [query, setQuery] = useState({});
    const [tokenResult, setTokenResult] = useState({});
    const [idTokenDecode, setIdTokenDecode] = useState({});
    const [data, setData] = useState({
        line_id: "",
    });
    const location = useLocation();

    // 你的 LINE Bot ID
    const lineBotId = '@629iqlfn';
    const lineAddFriendUrl = `https://line.me/R/ti/p/${lineBotId}`;
    const navigate = useNavigate();

    useEffect(() => {
        // 解析網址參數
        const params = new URLSearchParams(location.search);
        const queryParams = {};
        for (let [key, value] of params.entries()) {
            queryParams[key] = value;
        }
        setQuery(queryParams);

        // 設定POST參數
        const options = qs.stringify({
            grant_type: 'authorization_code',
            code: queryParams.code,
            redirect_uri: process.env.REACT_APP_LINE_CBURL,
            client_id: process.env.REACT_APP_LINE_LOGIN_ID,
            client_secret: process.env.REACT_APP_LINE_LOGIN_SECRET
        });

        // 發送請求並處理回應
        axios.post('https://api.line.me/oauth2/v2.1/token', options, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(res => {
            setTokenResult(res.data); // 設定回傳的結果
            const decodedIdToken = jwtDecode(res.data.id_token);
            setIdTokenDecode(decodedIdToken); // 解析 id_token

            const userLineId = decodedIdToken.sub;
            const username = decodedIdToken.name;
            const access_token = res.data.access_token;
            const StoreduserId = localStorage.getItem('userId') 
            const userId = JSON.parse(StoreduserId);

            setData(userId)
            setData({ userId, username, access_token });
            
            console.log(userLineId)
            console.log(userId)
            const data = {
                userLineId: userLineId,
                userId: userId
            }

            axios
                .post('http://localhost:8080/recieve', data)
                .then((res) => {
                    if( res.status == '201'){
                        alert("Line Id insert Success and already added friends");
                        console.log("Line Id insert Success and already added friends")
                        navigate(`/MainPage`);
                      }
                      else if( res.status == '200'){
                        alert("Line Id insert Success but no added friends yet");
                        console.log("Line Id insert Success but no added friends yet")

                      }
                      else{
                        alert("Log in Failed!");
                        console.log("Log in Failed!")

                      }
                })
        }).catch(error => {
            if (error.response) {
              // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
              console.error('Error Response:', error.response.data);
              console.error('Error Status:', error.response.status);
              console.error('Error Headers:', error.response.headers);
            } else if (error.request) {
              // 请求已经成功发起，但没有收到响应
              console.error('Error Request:', error.request);
            } else {
              // 发送请求时出了点问题
              console.error('Error Message:', error.message);
            }
            console.error('Error Config:', error.config);
        });
    }, []);


    // Function to handle adding the bot as a friend
    const handleAddFriend = () => {
        const lineAddFriendUrl = `https://line.me/R/ti/p/${lineBotId}`;
        window.open(lineAddFriendUrl, "_blank");
    }

    
    return (
        // <Fragment>
        //     <div className={styles.container}>
        //         <div className={styles['left-content']}>
        //             <div className={styles['text-center']}>
        //             <p>加入 LINE 好友完善通知功能</p>
        //             <button>登出</button>
        //             </div>
        //         </div>
                
        //         <div className={styles['right-sidebar']}>
        //             <iframe 
        //                 src={lineAddFriendUrl} 
        //                 className={styles.qrCode}
        //                 title="LINE Add Friend"
        //             />   
        //         </div>
        //     </div>
        // </Fragment>
        // <div style={{ display: 'flex', height: '100vh' }}>
        //     {/* Left half */}
        //     <div style={{
        //         width: '50%',
        //         display: 'flex',
        //         justifyContent: 'center',
        //         alignItems: 'center',
        //         flexDirection: 'column',
        //         padding: '20px'
        //     }}>
        //         <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        //         <p>加入 LINE 好友完善通知功能</p>
        //         </div>
        //         <button  style={{
        //         padding: '10px 20px',
        //         fontSize: '16px',
        //         cursor: 'pointer'
        //         }}>
        //         登出
        //         </button>
        //     </div>

        //     {/* Right half */}
        //     <div style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        //         <iframe
        //         src={lineAddFriendUrl}
        //         style={{
        //             width: '90%',
        //             height: '90%',
        //             border: 'none',
        //         }}
        //         title="Add LINE Friend"
        //         />
        //     </div>
        // </div>


        <div className={styles.container}>
            <div className={styles.content}>
                <h1>Receive Page</h1>
                <h3>回傳回來的值：{JSON.stringify(query)}</h3>
                <hr />
                <h1>Token API</h1>
                <h3>回傳回來的值: {JSON.stringify(tokenResult)}</h3>
                <hr />
                <h1>IdToken Decode</h1>
                <h3>解析後的值: {JSON.stringify(idTokenDecode)}</h3>
                <hr />
                <h1>需傳入後端的值</h1>
                <h3>解析後的值: {JSON.stringify(data)}</h3>
                <hr />
                <Link to="/Login">回登入頁</Link>
                <hr />
                <button onClick={handleAddFriend}>加入 LINE 好友</button>
            </div>
        </div>
    );
}

export default Recieve;