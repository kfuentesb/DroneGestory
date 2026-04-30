import { AuthProvider } from './components/AuthProvider';
import './App.css';
import Footer from './components/main-elements-views/Footer';
import RouterPrincipal from './router/RouterPrincipal';
import Navbar from './components/main-elements-views/Navbar';
import MainLayout from './components/layout/MainLayout';
import ScrollToTop from './components/commons/ScrollToTop';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Navbar />

        <MainLayout>
          <RouterPrincipal />
        </MainLayout>

        <Footer />
        <ScrollToTop />
      </AuthProvider>
    </div>
  );
}

export default App;