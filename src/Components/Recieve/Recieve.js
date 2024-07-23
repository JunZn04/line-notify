import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import { jwtDecode } from 'jwt-decode';
import styles from './ReceivePage.module.css'; // 引入CSS模塊

function Recieve(){
    const [query, setQuery] = useState({});
    const [tokenResult, setTokenResult] = useState({});
    const [idTokenDecode, setIdTokenDecode] = useState({});
    
    const location = useLocation();
  
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
        setIdTokenDecode(jwtDecode(res.data.id_token)); // 解析 id_token
      });
    }, [location.search]);
  
    return (
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
            <Link to="/">回登入頁</Link>
            </div>
        </div>
    );
}

export default Recieve;