// import { useState } from 'react';
import './App.css';
import Footer from './components/Footer';
import RouterPrincipal from './router/RouterPrincipal';
import Navbar from './components/Navbar';

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Navbar />
      <main>
        <RouterPrincipal />
        {/* <button type="button" className="btn btn-warning">
          Warning
        </button> */}
      </main>

      <Footer />
    </div>
  )
}

export default App
