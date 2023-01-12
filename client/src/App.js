import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import SignIn from "./screens/signIn";
import CreateAccount from "./screens/createAccount";
import Home from "./screens/home";
import DirectMessage from "./screens/directMessage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/createAccount" element={<CreateAccount />} />
        <Route path="/home"element={<Home />} />
        <Route path="/home/directMessage" element={<DirectMessage />} />
      </Routes>
    </Router>
  );
}

export default App;
