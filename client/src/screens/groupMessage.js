import React from 'react'
import { useLocation,useNavigate } from 'react-router-dom'
import MessageItem from '../components/MessageItem';
import {useState,useEffect} from "react";
import {io} from "socket.io-client"

const socket = io("http://localhost:8000");

export default function DirectMessage() {


    const location = useLocation();
    const navigate = useNavigate();
    const [messages,setMessages] = useState([]);
    const [onlineUsers,setOnlineUsers] = useState([]);
    const [offlineUsers,setOfflineUsers] = useState([]);

    useEffect(()=>{
        socket.emit("joinGroupRoom",location.state.room);
      socket.emit("getMemberList"); 
    },[])



    socket.on("updatedMemberList",members=>{
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
      setOnlineUsers(online);
      setOfflineUsers(offline);

    })

    socket.on("joinedRoom",()=>{
        console.log("joinedRoom",location.state.room);
        socket.emit("getMessages",location.state.room);
    })

    socket.on("retrievedMessages",messages=>{
        console.log("test");
        setMessages(messages);
    })

    
    const getDate = ()=>{
      const date = new Date();
  
      var hours = date.getHours();
      var amPM = hours >= 12 ? "PM" : "AM";
  
      hours = hours % 12; //convert from military time to standard time
      hours = hours != 0 ? hours : 12;
  
      var minutes = date.getMinutes();
      minutes = minutes < 10 ? "0" + minutes : minutes;
  
      return date.getMonth() + 1 + "/" + 
             date.getDate() + "/" +
             date.getFullYear() + " " + 
             hours + ":" + 
             minutes +  "" + 
             amPM;
  
  }

  const logout = ()=>{
    socket.emit("logout",location.state.name);
    navigate("/");
  };
  const uploadMessage = (message)=>{
    
    if(message !== ""){
      let date = getDate();
      let userMessage = {name:location.state.name,message:message,date:date};
      document.getElementById("input").value = "";
      socket.emit("uploadMessage",userMessage,location.state.room);
    }
  }


  
  return (
    <div className='container'>
      <div className='sideBar'>
      <button className = "logoutButton" onClick = {()=>logout()}>log out</button>
        <div className='online'>
          <h4>Online - {onlineUsers.length - 1}</h4>
          {onlineUsers.filter(users=>users.user != location.state.name).map(users =>(<p >{users.user}</p>))}
        </div>
        <div className='offline'>
          <h4>Offline - {offlineUsers.length}</h4>
          {offlineUsers.map(user => (<p>{user.user}</p>))}
        </div>
      </div>
      <div className='chatBox'>
      <div className='chatHeader'>
          <h2>@{location.state.visitorName.map(user=>(<>{user + " "}</>))}</h2>
        </div>
        
        {messages.map(item=>(<MessageItem username={item.name} messageItem={item.message} date={item.date}/>))}
      </div>
      <div className='messageBox'>
        <div className='inputBox'>
          <input id = "input" className='input' type='text' placeholder="message" onKeyDown={(e)=>{if(e.key === "Enter"){uploadMessage(e.target.value)}}}/>
        </div>
      </div>
      
    </div>
  )
}
