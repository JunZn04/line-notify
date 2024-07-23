import React from 'react';
import styles from './LineLogin.module.css'; // 引入CSS模塊

function LineLogin() {
  const loginEvent = () => {
    let URL = 'https://access.line.me/oauth2/v2.1/authorize?';
    URL += 'response_type=code'; // 希望LINE回應什麼 目前只有code能選
    URL += `&client_id=${process.env.REACT_APP_LINE_LOGIN_ID}`; // 你的頻道ID
    URL += `&redirect_uri=${process.env.REACT_APP_LINE_CBURL}`; // 要接收回傳訊息的網址
    URL += '&state=123456789'; // 用來防止跨站請求的 通常設亂數 這邊就先放123456789
    URL += '&scope=openid%20profile'; // 跟使用者要求的權限
    URL += '&nonce=helloWorld'; // 用於避免重放攻擊的隨機字串
    URL += '&bot_prompt=normal'; // 提示用戶加機器人為好友
    window.open(URL, '_self'); // 轉跳到該網址
  };

  return (
    <div className={styles.container}>
      <h1>InstAi v0.7<br/>Line-Notify-Practice</h1>
      <button className={styles.loginButton} onClick={loginEvent}>
        登錄使用 Line
      </button>
    </div>
  );
}

export default LineLogin;
