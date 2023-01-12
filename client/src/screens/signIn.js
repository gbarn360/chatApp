import React from 'react'
import {useState, useEffect} from "react"
import { useNavigate } from "react-router-dom";
import {io} from "socket.io-client"

const socket = io("http://localhost:8000")

export default function SignIn() {


    const [username,setUsername] = useState("");
    const [response,setResponse] = useState("");

    const navigate = useNavigate();

    const verify = ()=>{
        if(username.length == 0){
            document.getElementById("logInText").placeholder = "enter name";
        }
        else{
            socket.emit("signIn",username,socket.id);
        }
    }
  

    socket.on("signInResponse",(response,members)=>{
        if(response === true){
            var online = new Array();
            var offline = new Array();
            for(let i = 0;i<members.length;i++){
            if(members[i].status === "online"){
                online[i] = members[i];
            }
            else{
                offline[i] = members[i];
            }
            }
            navigate("/home",{state:{name:username,online:online,offline:offline}});
        }
        else{
            setResponse("account not found");
        }
    });

  return (
    <div className='container'>

        <div className='space'>
            <input id = "logInText" type="text" placeholder="username" onChange={(e)=>{setUsername(e.target.value)}}/>
            <button onClick={()=>verify()}>log in</button>
            <button onClick={()=>navigate("/createAccount")}>Create Account</button>
        </div>
        {response}
    </div>
  )
}
