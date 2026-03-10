import { AuthProvider } from './components/AuthProvider';
import './App.css';
import Footer from './components/commons/Footer';
import RouterPrincipal from './router/RouterPrincipal';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <AuthProvider>
      <main>
        <Navbar />
          <RouterPrincipal />
      
      </main>
      <Footer />
      </AuthProvider>
    </div>
  )
}

export default App
