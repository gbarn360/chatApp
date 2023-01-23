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
    const [room,setRoom] = useState();

    useEffect(()=>{
      let date = getDate();
      let modifiedDate = date.split(" ")[0];
      socket.emit("getMemberList"); 

      socket.emit("getRoom",location.state.name,location.state.visitorName,modifiedDate);

    },[])


    socket.on("retrievedRoom",room =>{
        setRoom(room);
        socket.emit("getMessages",room);
    })

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

    socket.on("retrievedMessages",messages=>{
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
      socket.emit("uploadMessage",userMessage,room);
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
          <h2>@{location.state.visitorName}</h2>
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
