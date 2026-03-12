import { AuthProvider } from './components/AuthProvider';
import './App.css';
import Footer from './components/commons/Footer';
import RouterPrincipal from './router/RouterPrincipal';
import Navbar from './components/commons/Navbar';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Navbar />

        <MainLayout>
          <RouterPrincipal />
        </MainLayout>

        <Footer />
      </AuthProvider>
    </div>
  );
}

export default App;