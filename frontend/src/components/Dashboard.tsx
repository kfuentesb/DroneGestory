import React from 'react'
import { useAuth } from './AuthProvider';

function Dashboard() {
  const {username} = useAuth();
  return (
    <div>
      <h1>Bienvenido, {username}</h1>
    </div>
  )
}

export default Dashboard