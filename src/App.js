import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LineLogin from "./Components/LineLogin/LineLogin"
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
import Recieve from './Components/Recieve/Recieve'

function App() {
  return(
    <div className="App">
      <Router>
        <Routes>
          <Route path="/Login" element = { <Login/> }/>
          <Route path="/" element = { <Register/> }/> 
          <Route path="/recieve" element = { <Recieve/> }/> 
        </Routes>
      </Router>
    </div>
  )
}

export default App;
