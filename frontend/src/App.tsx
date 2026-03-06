import { useState } from 'react';
import './App.css';
import Footer from './components/Footer';
import LogIn from './components/LogIn';
import PilotsView from './components/PilotsView';
import OperationsView from './components/OperationsView';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      {/* <header className="header">
        <h1>Drone Gestory</h1>
      </header> */}

      <main>
        <PilotsView />
        <OperationsView />

        {/* <button type="button" className="btn btn-warning">
          Warning
        </button> */}
      </main>

      <Footer />
    </div>
  )
}

export default App
