import React from 'react'

export default function MessageItem({username,messageItem,date}) {

  return (
    <div className='messageContainer'>
        <div className='messageHeader'>
            <h2 className='messageUser'>{username}</h2>
            <h5 className='date'>{date}</h5>
        </div>
        <p className='message'>{messageItem}</p>
      
    </div>
  )
}
