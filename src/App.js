import { useState } from 'react';
import './App.css';
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'

// const API_URL = 'http://18.219.127.156:5000';


function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);

  const onSwitchToSignup = (e) => 
  {
    setCurrentView('signup');
  };

  const onSwitchToLogin = (e) => 
  {
    setCurrentView('login');
  }

  const handleLoginSuccess = (userData) =>
  {
    setUser(userData);
    setCurrentView('dashboard');
  }

  const onLogout = (e) =>
  {
    setUser(null);
    setCurrentView('login');
  }

  return (
    <div>
        {currentView === "login" && <Login onSwitchToSignup={onSwitchToSignup}
                                           onLoginSuccess={handleLoginSuccess} />}
        {currentView === "signup" && <Signup onSwitchToLogin={onSwitchToLogin} />}
        {currentView === "dashboard" && <Dashboard user={user} onLogout={onLogout}/>}
    </div>
  );
}

export default App;
