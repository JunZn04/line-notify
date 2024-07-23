import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LineLogin from "./Components/LineLogin/LineLogin"
import Recieve from './Components/Recieve/Recieve'

function App() {
  return(
    <div>
      <Router>
        <Routes>
          <Route path="/" element = { <LineLogin/> }/>
          <Route path="/recieve" element = { <Recieve/> }/> 
        </Routes>
      </Router>
    </div>
  )
}

export default App;
