import { AuthProvider } from './components/AuthProvider';
import './App.css';
import Footer from './components/Footer';
import RouterPrincipal from './router/RouterPrincipal';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <main>
        <AuthProvider>
        <Navbar />
          <RouterPrincipal />
          {/* <button type="button" className="btn btn-warning">
          Warning
        </button> */}
        <Footer />
      </AuthProvider>
      </main>
    </div>
  )
}

export default App
