import { useEffect } from 'react';
import api from './services/api';

function App() {
  useEffect(() => {
    console.log('API_URL:', import.meta.env.VITE_API_URL);
    api.get('/')
      .then(res => console.log('✅ API OK:', res.data))
      .catch(err => console.error('❌ Erreur:', err.message));
  }, []);

  return <div>Test API - Regarde la console</div>;
}

export default App;