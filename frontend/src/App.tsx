import { AuthProvider } from './components/AuthProvider';
import './App.css';
import Footer from './components/commons/Footer';
import RouterPrincipal from './router/RouterPrincipal';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <AuthProvider>
<<<<<<< HEAD
      <main>
        <Navbar />
          <RouterPrincipal />
      
      </main>
      <Footer />
=======
        <main>

          <Navbar />
          <RouterPrincipal />
          {/* <button type="button" className="btn btn-warning">
          Warning
        </button> */}

        </main>
        <Footer />
>>>>>>> fc3d1b451d83627e82cf121bfcc5b8f22daad4bc
      </AuthProvider>
    </div>
  )
}

export default App
