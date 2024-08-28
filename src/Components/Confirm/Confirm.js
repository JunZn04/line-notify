import React, { useState, useEffect, Fragment } from "react";
import basestyle from "../Base.module.css";
import confirmstyle from "./Confirm.module.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Confirm = ({ setUserState }) => {
  const navigate = useNavigate(); 

  const loginEvent = (e) => {
    e.preventDefault();
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
    <Fragment>
      <div className={confirmstyle.container}>
        <header>
          <h1>InstAi</h1>
        </header>
        <div className={confirmstyle.login}>
          <form>
            <legend>Comfirm account</legend>
            <p>
              要綁定Line帳號嗎
            </p>
            <Link to="/MainPage">
              <button className={basestyle.button_common}>
                Go to project
              </button>
            </Link>
            <button className={confirmstyle.Line} onClick={loginEvent}>
              綁定Line
            </button>
          </form>
        </div>
        <div className={confirmstyle.email}>
          Have questions? Send email to <b>support@instai.co</b>
        </div>
      </div>
    </Fragment>
  );
};

export default Confirm;
