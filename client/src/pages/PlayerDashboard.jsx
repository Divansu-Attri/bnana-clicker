import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import RankPage from './RankPage';

const PlayerDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [bananaCount, setBananaCount] = useState(user?.bananaCount || 0);
  const [message, setMessage] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    if (user && socket) {
      const fetchInitialCount = async () => {
        try {
          const response = await fetch(`${backendUrl}/api/users/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (response.ok) {
            setBananaCount(data.bananaCount);
          } else {
            console.error('Failed to fetch initial banana count:', data.message);
          }
        } catch (error) {
          console.error('Error fetching initial banana count:', error);
        }
      };
      fetchInitialCount();

      socket.on('bananaCountUpdate', (updatedUser) => {
        if (user && updatedUser._id === user.id) {
          setBananaCount(updatedUser.bananaCount);
          setMessage(`Your banana count updated: ${updatedUser.bananaCount}`);
          setTimeout(() => setMessage(''), 2000);
        }
      });

      return () => {
        socket.off('bananaCountUpdate');
      };
    }
  }, [user, socket, token]);

  const handleBananaClick = () => {
    if (socket && user) {
      socket.emit('bananaClick', { userId: user.id });
    } else {
      setMessage('Not connected to server or not logged in.');
    }
  };

  return (
    <Container className="my-3 text-center">
      <h2 className="mb-4">Player Dashboard</h2>

      <Card className="shadow-lg border-0 d-inline-block p-4">
        <Card.Text className="fs-4 text-muted mb-3">Your Banana Count:</Card.Text>
        <Card.Text className="display-1 fw-bold text-warning mb-4 animate__animated animate__pulse animate__infinite">
          {bananaCount}
        </Card.Text>
        <Button
          variant="warning"
          size="lg"
          className="rounded-pill shadow-lg fw-bold fs-3 px-5 py-3 position-relative overflow-hidden"
          onClick={handleBananaClick}
          style={{ transform: 'scale(1)', transition: 'transform 0.2s ease-in-out' }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span className="position-relative z-1">🍌 Click Banana 🍌</span>
          <span className="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-25 rounded-circle" style={{ transform: 'scale(0)', transition: 'transform 0.5s ease-out' }}></span>
        </Button>
        {message && (
          <Alert variant="success" className="mt-3 text-center">
            {message}
          </Alert>
        )}
      </Card>

      <div className="mt-5">
        <h3 className="mb-4">Real-time Rankings</h3>
        <RankPage />
      </div>
    </Container>
  );
};

export default PlayerDashboard;