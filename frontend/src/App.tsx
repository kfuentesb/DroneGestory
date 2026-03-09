import { useState } from 'react';
import './App.css';
import Footer from './components/Footer';
import RouterPrincipal from './router/RouterPrincipal';
import Navbar from './components/Navbar';

function App() {


  return (
    <div className="App">
      <Navbar />
      <main>
        <RouterPrincipal />
      </main>
      <Footer />
    </div>
  )
}

export default App
