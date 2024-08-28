import React from 'react';
import { Link } from 'react-router-dom';
import styles from './MainPage.module.css'; // 引入样式模块

function LoginSuccess() {
  return (
    <div className={styles['login-success']}>
      <h1>Login Success</h1>
      <Link to="/Login">回登入頁</Link>
    </div>
  );
}

export default LoginSuccess;
