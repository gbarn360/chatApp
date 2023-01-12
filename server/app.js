//socket.IO
//npm install socket.io
const io = require('socket.io')(8000,{
    cors:{
        origin:["http://localhost:3000"]
    }
})

io.on('connection',socket =>{ 
    console.log("connected")


    socket.on("signIn",(username,id)=>{
        let result = checkMembers(username);
        if(result === true){
            let userStatus = "online";
            updateMemberStatus(username,userStatus);
            io.emit("updatedMemberList",members);
        }
        io.to(id).emit("signInResponse",result,members);
    })

    socket.on("createAccount",(username,id)=>{
        let result = checkMembers(username);
        if(result === false){
            members.push({user:username,status:"offline",id:id});
        }
        io.to(id).emit("createAccountResponse",result);
    })

    socket.on("getMemberList",()=>{
        io.emit("updatedMemberList",members);
    })

    socket.on("logout",username=>{
        let userStatus = "offline";
        updateMemberStatus(username,userStatus);
        io.emit("updatedMemberList",members);
    })

    socket.on("uploadMessage",(message,room)=>{

        memberMessages.push({message:message,room:room});

        let messages = getMessages(room);

        io.to(room).emit("retrievedMessages",messages);

    })
    socket.on("getMessages",room=>{
        let messages = getMessages(room);
        io.to(room).emit("retrievedMessages",messages);
    })

    socket.on("getRoom",(user1,user2,date)=>{
        var roomIndex = getRoom(user1,user2);

        if(roomIndex != -1){ //room exists
            let roomNumber = rooms[roomIndex].roomNumber;
            socket.join(roomNumber);
            io.emit("retrievedRoom",roomNumber);   
        }
        else{ //room does not exist (needs to be created)
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var roomNumber = "";
            for(let i = 0;i<5;i++){
                roomNumber += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            rooms.push({user1:user1,user2:user2,roomNumber:roomNumber,createdDate:date});
            socket.join(roomNumber);
            io.emit("retrievedRoom",roomNumber);
        }
    })
    socket.on("getChatGroups",(user,id)=>{

        let users = getChatGroups(user);
        var groups = [];
        for(let i=0; i<users.length; i++){
            groups[i] = {user:users[i].user, date:users[i].date}
        }

        io.to(id).emit("retrievedChatGroups",groups);
    })
    
})
var members = [];
var memberMessages = [];
var rooms = [];

const checkMembers = (user)=>{
    for(let i = 0;i < members.length;i++){
        if(members[i].user === user){
            return true;
        }
    }
    return false;
}

const updateMemberStatus = (user,userStatus)=>{
    for(let i = 0;i < members.length;i++){
        if(members[i].user === user){
            members[i].status = userStatus;
        }
    }
}

const getRoom = (user1,user2) => {
    for(let i = 0;i<rooms.length;i++){
        if(rooms[i].user1 === user1 &&rooms[i].user2 === user2 || rooms[i].user1 === user2 &&rooms[i].user2 === user1){
            return i;
        }
    }
    return -1;
}

const getMessages =(room) =>{
    var messages = [];
    var messageIndex = 0;
    for(let i = 0;i<memberMessages.length;i++){
        if(memberMessages[i].room === room){
            messages[messageIndex] = memberMessages[i].message;
            messageIndex++;
        }
    }
    return messages;
}

const getChatGroups =(user) =>{
    var group = [];
    var groupIndex = 0;
    for(let i = 0;i<rooms.length;i++){
        if(rooms[i].user1 === user){
            group[groupIndex] = {user: rooms[i].user2,date: rooms[i].createdDate};
            groupIndex++;
        }
        else if(rooms[i].user2 === user){
            group[groupIndex] = {user: rooms[i].user1,date: rooms[i].createdDate};
            groupIndex++;
        }
    }
    return group;
}
