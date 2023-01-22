import React from 'react'
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"

const socket = io("http://localhost:8000")

export default function SignIn() {


    const [username, setUsername] = useState("");
    const [signInResponse, setSignInResponse] = useState("");
    const [createAccountResponse, setCreateAccountResponse] = useState("");


    const navigate = useNavigate();

    const verifySignIn = () => {
        if (username.length == 0) {
            document.getElementById("logInText").placeholder = "enter name";
        }
        else {
            socket.emit("signIn", username, socket.id);
        }
    }

    const verifyCreateAccount = () => {
        if (username.length == 0) {
            document.getElementById("logInText").placeholder = "enter name";
        }
        else {
            socket.emit("createAccount", username, socket.id);
        }
    }



    socket.on("signInResponse", (response, members) => {
        if (response === true) {
            var online = new Array();
            var offline = new Array();
            for (let i = 0; i < members.length; i++) {
                if (members[i].status === "online") {
                    online[i] = members[i];
                }
                else {
                    offline[i] = members[i];
                }
            }
            navigate("/home", { state: { name: username, online: online, offline: offline } });
        }
        else {
            setSignInResponse("account not found");
        }
    });

    socket.on("createAccountResponse", response => {
        if (response === true) {
            setCreateAccountResponse("account already exists");
        }
        else {
            setCreateAccountResponse("account created");
        }
    })

    return (
        <div className='container'>

            <div className='signInCover'>
                <h1 className='header'>Sign In</h1>
            </div>

            <div className='signIn'>
                <div className='form'>
                    <input id="logInText" type="text" placeholder="username" onChange={(e) => { setUsername(e.target.value) }} />
                    <button className='formButton' onClick={() => verifySignIn()}>log in</button>
                </div>
                <p className='response'>{signInResponse}</p>

            </div>




            <div className='createAccountCover'>
                <h1 className='header'>Create Account</h1>
            </div>
            <div className='createAccount'>
                <div className='form'>
                    <input id="logInText" type="text" placeholder="username" onChange={(e) => { setUsername(e.target.value) }} />
                    <button className='formButton' onClick={() => verifyCreateAccount()}>create</button>
                </div>
                <p className='response'>{createAccountResponse}</p>

            </div>
        </div>
    )
}
