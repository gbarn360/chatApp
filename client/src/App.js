import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import SignIn from "./screens/signIn";
import CreateAccount from "./screens/createAccount";
import Home from "./screens/home";
import DirectMessage from "./screens/directMessage";
import GroupMessage from "./screens/groupMessage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/createAccount" element={<CreateAccount />} />
        <Route path="/home"element={<Home />} />
        <Route path="/home/directMessage" element={<DirectMessage />} />
        <Route path="/home/GroupMessage" element={<GroupMessage />} />
      </Routes>
    </Router>
  );
}

export default App;
