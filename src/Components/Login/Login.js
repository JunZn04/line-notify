import React, { useState, useEffect, Fragment } from "react";
import basestyle from "../Base.module.css";
import loginstyle from "./Login.module.css";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";

const Login = ({ setUserState }) => {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [user, setUserDetails] = useState({
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const validateForm = (values) => {
    const error = {};
    const regex = /^[^\s+@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!values.email) {
      error.email = "Email is required for login";
    } else if (!regex.test(values.email)) {
      error.email = "Please enter a valid email address";
    }
    if (!values.password) {
      error.password = "Password is required for login";
    }
    return error;
  };

  const loginHandler = (e) => {
    e.preventDefault();
    setFormErrors(validateForm(user));
    setIsSubmit(true);
  };

  useEffect(() => {
    if (Object.keys(formErrors).length === 0 && isSubmit) {
      axios
        .post("http://localhost:8080/signin", user)
        .then((res) => {
          if (res.data.status == "Success") {
            alert("Log in Success!");
            navigate(`/recieve`);
          }
          else if (res.data.status == "errr") {
            alert("Log in Failed!");
            setUserDetails({
              email: "",
              password: "",
            });
          }
        });
    }
  }, [formErrors, isSubmit]);

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
      <div className={loginstyle.container}>
        <header>
          <h1>InstAi</h1>
        </header>
        <div className={loginstyle.login}>
          <form>
            <legend>Sign In</legend>
            <label>Email</label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={changeHandler}
              value={user.email}
            />
            <p className={basestyle.error}>{formErrors.email}</p>
            <label>Password</label>
            <input
              type="password"
              name="password"
              id="password"
              onChange={changeHandler}
              value={user.password}
            />
            <p className={basestyle.error}>{formErrors.password}</p>
            <button className={basestyle.button_common} onClick={loginHandler}>
              SIGN IN
            </button>
            <button className={loginstyle.Line} onClick={loginEvent}>
              登錄使用 Line
            </button>
            <NavLink className={loginstyle.NavLink} to="/">
              Create a new account
            </NavLink>
          </form>
        </div>
        <div className={loginstyle.email}>
          Have questions? Send email to <b>support@instai.co</b>
        </div>
      </div>
    </Fragment>
  );
};

export default Login;
