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
  const [chatGroups, setChatGroups] = useState([]); //used for displaying 1 on 1 chats
  const [groups, setGroups] = useState([]); //used for displaying 1 on * chats
  const [name, setName] = useState([]);
  const [groupMembers, setGroupMembers] = useState([name]); //used for creating a group

  useEffect(() => {
    socket.emit("getMemberList"); //get online/offline members when navigated to home page

  }, [])


  socket.on("retrievedChatGroups", groups => { //get 1 on 1 chats
    setChatGroups(groups);
  });

  socket.on("updatedChatGroups", () => { //get updated chat groups
    socket.emit("getChatGroups", name, socket.id);
  })
  socket.on("updatedMemberList", members => { //update online/offline members lists
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

    socket.emit("getChatGroups", name, socket.id); //get 1 on 1 chats
  })

  socket.on("createdGroupRoom", room => { //returns a created room
    socket.emit("getGroupRoom", room, socket.id, name); //get the members of group room
  })
  socket.on("retrievedGroupRoom", groupMembers => { //get group chats
    var group = [];
    var index = 0;
    console.log(groupMembers);
    console.log("0 index: ", groupMembers[0].length);

    for (let i = 0; i < groupMembers.length; i++) {
      for (let j = 0; j < groupMembers[i].length; j++) {
        if (groupMembers[i][j] != name) {
          group[index] = groupMembers[i][j];
          index++;
        }
      }
    }

    setGroups(group);
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
          {onlineUsers.filter(users => users.user != location.state.name).map(users => (<p onClick={() => { navigate("/home/directMessage", { state: { name: name, visitorName: users.user } }) }}>{users.user}</p>))}
        </div>
        <div className='offline'>
          <h4>Offline - {offlineUsers.length}</h4>
          {offlineUsers.map(users => (<p onClick={() => { navigate("/home/directMessage", { state: { name: name, visitorName: users.user } }) }}>{users.user}</p>))}
        </div>
      </div>
      <div className='chatBox'>
        <div className='chatHeader'>
          <h2>Chat groups</h2>
          <button className='button' id='createGroupButton' onClick={() => document.getElementById("manageGroupModal").style.display = 'block'}> Create Group</button>
        </div>

        <div id="manageGroupModal" className="manageGroupModal">
          <button className='exit' onClick={() => { document.getElementById("manageGroupModal").style.display = "none"; document.getElementById("addMemberInput").value = ""; setGroupMembers([name]) }}>X</button>
          <div className='addMember'>

            <button className='button' id="addMember" onClick={() => { setGroupMembers(prev => [...prev, document.getElementById("addMemberInput").value + " "]) }}>add Member</button>

          </div>

          {onlineUsers.filter(users => users.user != location.state.name).map((user, index) => (<div className='displayUser'><input type="checkbox" name={user.user} /><link for={user.user} style={{ padding: "5px" }} >{user.user}</link></div>))}
          {offlineUsers.map((user, index) => (<div className='displayUser'><input type="checkbox" value="name" /><p style={{ padding: "5px" }} >{user.user}</p></div>))}

          <button className='button' id='createGroup' onClick={() => { document.getElementById("manageGroupModal").style.display = "none"; socket.emit("createGroup", groupMembers); document.getElementById("addMemberInput").value = ""; setGroupMembers([name]) }}>Create Group</button>

        </div>
        {groups.map(groups => (<div onClick={(event) => navigateToChat(event, groups)} className="chatGroup">{groups.user} <p className='chatGroupDate'>Created: {groups.date}</p><button className='button' id="leaveGroup" onClick={() => { document.getElementById("manageGroupModal").style.display = "none"; socket.emit("leaveGroup", name, groups.room) }}>leave group</button></div>))}
        {chatGroups.map(groups => (<div onClick={(event) => navigateToChat(event, groups)} className="chatGroup">{groups.user} <p className='chatGroupDate'>Created: {groups.date}</p><button className='button' id="leaveGroup" onClick={() => { document.getElementById("manageGroupModal").style.display = "none"; socket.emit("leaveGroup", name, groups.room) }}>leave group</button></div>))}
      </div>
      <div className='homeFiller'>

      </div>

    </div >
  )
}
