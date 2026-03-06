// import { useState } from 'react';
import './App.css';
import Footer from './components/Footer';
import RouterPrincipal from './router/RouterPrincipal';

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div className="App">
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
