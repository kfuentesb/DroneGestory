// import { useState } from 'react';
import './App.css';
import Footer from './components/Footer';
<<<<<<< HEAD
// import LogIn from './components/LogIn';
import PilotsView from './components/PilotsView';
// import OperationsView from './components/OperationsView';
=======
import RouterPrincipal from './router/RouterPrincipal';
>>>>>>> kevin

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="header">
        <h1>Drone Gestory</h1>
      </header>

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
