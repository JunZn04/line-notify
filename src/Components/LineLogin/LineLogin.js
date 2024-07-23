import React from 'react';
import styles from './LineLogin.module.css'; // 引入CSS模塊

function LineLogin() {
  return (
    <div className={styles.container}>
      <h1>InstAi v0.7<br/>Line-Notify-Practice</h1>
      <a href={`https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.REACT_APP_LINE_LOGIN_ID}&redirect_uri=${process.env.REACT_APP_LINE_CBURL}&state=123456789&scope=openid%20profile&nonce=helloWorld`}>
        登錄使用 Line
      </a>
    </div>
  );
}

export default LineLogin;
