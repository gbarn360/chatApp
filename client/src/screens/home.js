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

  useEffect(() => {
    socket.emit("getMemberList") ; //get online/offline members when navigated to home page

  }, [])


  socket.on("retrievedChatGroups", (singleChats,groupChats) => { //getting chats
    var members = [];
    var date;
    var groups = [];
    var room;
    for(let i = 0;i<groupChats.length;i++) { //filtering out user name from member names
      for(let j = 0;j<groupChats[i].members.length;j++) {

          if(groupChats[i].members[j] != location.state.name){

            members.push(groupChats[i].members[j]);
            date = groupChats[i].date;
            room = groupChats[i].room;
          }
      }
      groups.push({members:members,date:date,room:room});
      members = [];
    }
    setGroups(groups);  //update group chat groups
    setChatGroups(singleChats); //update single chat groups


  });
 

  socket.on("updatedChatGroups", () => { //get updated chat groups when user leaves group
    socket.emit("getChatGroups", location.state.name, socket.id); 
  })



  socket.on("updatedMemberList", members => { //update online/offline member lists
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

    socket.emit("getChatGroups",location.state.name, socket.id); //get single and group chats
    
  })

  socket.on("createdGroupRoom", rooms => { //returns a created room

    socket.emit("getChatGroups",location.state.name, socket.id); //get chat groups 
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
    if(groups.user != undefined)
      navigate("/home/directMessage", { state: { name: location.state.name, visitorName: groups.user } });
    else    
       navigate("/home/groupMessage", { state: { name: location.state.name, visitorName: groups.members, room:groups.room } });
    

  };

  const setCheckedUsers = ()=>{
    let checkboxes = document.querySelectorAll("input[type=checkbox]");
    let checkedUsers = [];
    
    checkboxes.forEach((checkbox,i) =>{
      if(checkbox.checked == true){
        checkedUsers.push(checkboxes[i].name)
      }
    });
    let date = getDate();
    let modifiedDate = date.split(" ")[0];

    socket.emit("createGroup",location.state.name, checkedUsers,modifiedDate);
    
    
  }

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
    
    

  return (
    <div className='container'>
      <div className='sideBar'>
        <h1 className="greetingUser">Hi, {location.state.name}</h1>
        <button className="logoutButton" onClick={() => logout()}>log out</button>
        <div className='online'>
          <h4>Online - {onlineUsers.length - 1}</h4>
          {onlineUsers.filter(users => users.user != location.state.name).map(users => (<p onClick={() => { navigate("/home/directMessage", { state: { name: location.state.name, visitorName: users.user }}) }}>{users.user}</p>))}
        </div>
        <div className='offline'>
          <h4>Offline - {offlineUsers.length}</h4>
          {offlineUsers.map(users => (<p onClick={() => { navigate("/home/directMessage", { state: { name: location.state.name, visitorName: users.user } }) }}>{users.user}</p>))}
        </div>
      </div>
      <div className='chatBox'>
        <div className='chatHeader'>
          <h2>Chat groups</h2>
          <button className='button' id='createGroupButton' onClick={() => document.getElementById("manageGroupModal").style.display = 'block'}> Create Group</button>
        </div>

        <div id="manageGroupModal" className="manageGroupModal">
          <button className='exit' onClick={() => { document.getElementById("manageGroupModal").style.display = "none"; let checkboxes = document.querySelectorAll('input[type=checkbox]'); checkboxes.forEach(item=>item.checked = false)}}>X</button>
          
          <div className='list'>
            {onlineUsers.filter(users => users.user != location.state.name).map((user, index) => (<div className='displayUser'><input type="checkbox" id="checkboxUser" name={user.user}  /><p style={{ padding: "5px" }} >{user.user}</p></div>))}
            {offlineUsers.map((user, index) => (<div className='displayUser'><input type="checkbox" name={user.user} /><p style={{ padding: "5px" }} >{user.user}</p></div>))}
          </div>
          <button className='button' id='createGroup' onClick={() => { document.getElementById("manageGroupModal").style.display = "none"; setCheckedUsers(); let checkboxes = document.querySelectorAll('input[type=checkbox]'); checkboxes.forEach(item=>item.checked = false)}}>Create Group</button>

        </div>
        {groups.map(groups => (<div onClick={(event) => navigateToChat(event, groups)} className="chatGroup">{groups.members + ""} <p className='chatGroupDate'>Created: {groups.date}</p><button className='button' id="leaveGroup" onClick={() => {  socket.emit("leaveGroup",location.state.name, groups.room,"groupChat") }}>leave group</button></div>))}
        {chatGroups.map(groups => (<div onClick={(event) => navigateToChat(event, groups)} className="chatGroup" >{groups.user} <p className='chatGroupDate'>Created: {groups.date}</p><button className='button' id="leaveGroup" onClick={() => { socket.emit("leaveGroup",location.state.name, groups.room,"singleChat") }}>leave group</button></div>))}
      </div>
      <div className='homeFiller'>

      </div>

    </div >
  )
}
