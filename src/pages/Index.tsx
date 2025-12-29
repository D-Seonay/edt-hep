import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    if (hasVisited === 'true' && !username) {
      navigate('/calendar', { replace: true });
    }
  }, [navigate]);

  return <LandingPage />;
};

export default Index;