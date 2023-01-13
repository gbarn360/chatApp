import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { io } from "socket.io-client"

const socket = io("http://localhost:8000")

export default function Home() {


  const location = useLocation();
  const navigate = useNavigate();

  const [onlineUsers, setOnlineUsers] = useState(location.state.online);
  const [offlineUsers, setOfflineUsers] = useState(location.state.offline);
  const [chatGroups, setChatGroups] = useState([]);
  const [name, setName] = useState(location.state.name);
  const [groupMembers, setGroupMembers] = useState([]);

  useEffect(() => {
    socket.emit("getMemberList");
  }, [])


  socket.on("retrievedChatGroups", groups => {
    setChatGroups(groups);
  });

  socket.on("updatedChatGroups", () => {
    socket.emit("getChatGroups", name, socket.id);
    console.log("works here")
  })
  socket.on("updatedMemberList", members => {
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
    setOnlineUsers(online);
    setOfflineUsers(offline);

    socket.emit("getChatGroups", name, socket.id);
  })

  const logout = () => {
    socket.emit("logout", location.state.name);
    navigate("/");
  };

  const navigateToChat = (e, groups) => {
    if (e.target != e.currentTarget) {
      e.stopPropagation();
      return;
    }
    navigate("/home/directMessage", { state: { name: name, visitorName: groups.user } });
  };


  return (
    <div className='container'>
      <div className='sideBar'>
        <h1 className="greetingUser">Hi, {location.state.name}</h1>
        <button className="logoutButton" onClick={() => logout()}>log out</button>
        <div className='online'>
          <h4>Online - {onlineUsers.length - 1}</h4>
          {onlineUsers.filter(users => users.user != name).map(users => (<p onClick={() => { navigate("/home/directMessage", { state: { name: name, visitorName: users.user } }) }}>{users.user}</p>))}
        </div>
        <div className='offline'>
          <h4>Offline - {offlineUsers.length}</h4>
          {offlineUsers.map(users => (<p onClick={() => { navigate("/home/directMessage", { state: { name: name, visitorName: users.user } }) }}>{users.user}</p>))}
        </div>
      </div>
      <div className='chatBox'>
        <div className='chatHeader'>
          <h2>Chat groups</h2>
        </div>

        <div id="manageGroupModal" className="manageGroupModal">
          <button className='exit' onClick={() => document.getElementById("manageGroupModal").style.display = "none"}>X</button>
          <div className='addMember'>
            <button className='button' id="addMember">add Member</button>
            <input className='button' placeholder='Member name' id="addMemberInput" />
          </div>
          <div className='removeMember'>
            <button className='button' id="removeMember">remove Member</button>
            <input className='button' placeholder='Member name' id="removeMemberInput" />
          </div>
          <div className='memberList'>
            {groupMembers == null ? "" : groupMembers.user}
          </div>

          <button className='button' id="leaveGroup" onClick={() => { document.getElementById("manageGroupModal").style.display = "none"; socket.emit("leaveGroup", name, groupMembers.room) }}>leave group</button>
        </div>

        {chatGroups.map(groups => (<div onClick={(event) => navigateToChat(event, groups)} className="chatGroup">{groups.user} <p className='chatGroupDate'>Created: {groups.date}</p> <button onClick={() => { document.getElementById("manageGroupModal").style.display = "block"; setGroupMembers(groups) }} className='manageGroup'>manage</button></div>))}
      </div>
      <div className='homeFiller'>

      </div>

    </div>
  )
}
