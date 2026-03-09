import React from 'react'

function Dashboard() {
  const username = localStorage.getItem("username");
  return (
    <div>
      <h1>Bienvenido, {username}</h1>
    </div>
  )
}

export default Dashboard