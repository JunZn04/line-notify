import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LineLogin from "./Components/LineLogin/LineLogin"
import Login from './Components/Login/Login'
import Confirm from './Components/Confirm/Confirm'
import Register from './Components/Register/Register'
import Recieve from './Components/Recieve/Recieve'
import MainPage from './Components/MainPage/MainPage'

function App() {
  return(
    <div className="App">
      <Router>
        <Routes>
          <Route path="/Login" element = { <Login/> }/>
          <Route path="/" element = { <Register/> }/> 
          <Route path="/recieve" element = { <Recieve/> }/> 
          <Route path="/Confirm" element = { <Confirm/> }/>
          <Route path="/MainPage" element = { <MainPage/> }/> 
        </Routes>
      </Router>
    </div>
  )
}

export default App;
