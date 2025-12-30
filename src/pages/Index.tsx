import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const showLandingPage = localStorage.getItem('showLandingPage');
    const username = localStorage.getItem('username');

    if (showLandingPage === 'false') {
      if (username) {
        navigate('/calendar', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [navigate]);

  return <LandingPage />;
};

export default Index;