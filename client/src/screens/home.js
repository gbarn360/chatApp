import React from 'react'
import { useState,useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import {io} from "socket.io-client"

const socket = io("http://localhost:8000")

export default function Home() {


  const location = useLocation();
  const navigate = useNavigate();

  const [onlineUsers,setOnlineUsers] = useState(location.state.online);
  const [offlineUsers,setOfflineUsers] = useState(location.state.offline);
  const [chatGroups,setChatGroups] = useState([]);
  const [name,setName] = useState(location.state.name);
  
  useEffect(()=>{
    socket.emit("getMemberList");
  },[])
  

  socket.on("retrievedChatGroups",groups=>{
    setChatGroups(groups);
  });
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

    socket.emit("getChatGroups",name,socket.id);
  })

  const logout = ()=>{
    socket.emit("logout",location.state.name);
    navigate("/");
  };
  
  
  return (
    <div className='container'>
      <div className='sideBar'>
        <h1 className = "greetingUser">Hi, {location.state.name}</h1>
        <button className = "logoutButton" onClick={()=>logout()}>log out</button>
        <div className='online'>
        <h4>Online - {onlineUsers.length - 1}</h4>
          {onlineUsers.filter(users=>users.user != name).map(users =>(<p onClick={()=>{navigate("/home/directMessage",{state:{name:name,visitorName:users.user}})}}>{users.user}</p>))}
        </div>
        <div className='offline'>
          <h4>Offline - {offlineUsers.length}</h4>
          {offlineUsers.map(users =>(<p onClick={()=>{navigate("/home/directMessage",{state:{name:name,visitorName:users.user}})}}>{users.user}</p>))}
        </div>
      </div>
      <div className='chatBox'>
        <div className='chatHeader'>
          <h2>Chat groups</h2>
        </div>
          {chatGroups.map(groups =>(<div onClick={()=>navigate("/home/directMessage",{state:{name:name,visitorName:groups.user}})} className = "chatGroup">{groups.user} <p className='chatGroupDate'>Created: {groups.date}</p></div>))}
      </div>
      <div className='homeFiller'>

      </div>
      
    </div>
  )
}
