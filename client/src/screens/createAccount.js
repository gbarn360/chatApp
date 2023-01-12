import React from 'react'
import {useState, useEffect} from "react"
import { useNavigate } from "react-router-dom";
import {io} from "socket.io-client"

const socket = io("http://localhost:8000");

export default function CreateAccount() {

    const [username,setUsername] = useState("");
    const [response,setResponse] = useState("");
    const navigate = useNavigate();

    const verify = ()=>{
        if(username.length == 0){
            document.getElementById("logInText").placeholder = "enter name";
        }
        else{
            socket.emit("createAccount", username,socket.id);
        }
    }

    socket.on("createAccountResponse",response => {
        if(response === true){
            setResponse("account already exists");
        }
        else{
            navigate("/");
        }
    })
  return (
    <div className='container'>

        <div className='space'>
            <input id = "logInText" type="text" placeholder="username" onChange={(e)=>{setUsername(e.target.value)}}/>
            <button onClick={()=>verify()}>create account</button>
            <button onClick={()=>navigate("/")}>Log in</button>
        </div>
        {response}
        
    </div>
  )
}
