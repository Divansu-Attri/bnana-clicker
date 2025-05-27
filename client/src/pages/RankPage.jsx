import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext'; 

const RankPage = () => {
  const { socket } = useContext(SocketContext);
  const { token } = useContext(AuthContext);
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    const fetchInitialRankings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/users/rankings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setRankings(data);
        } else {
          throw new Error(data.message || 'Failed to fetch initial rankings');
        }
      } catch (err) {
        console.error('Error fetching initial rankings:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialRankings();

    if (socket) {
      socket.on('rankingUpdate', (updatedRankings) => {
        setRankings(updatedRankings);
      });

      return () => {
        socket.off('rankingUpdate');
      };
    }
  }, [socket, token]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading rankings...</span>
        </Spinner>
        <p className="ms-3 text-muted">Loading rankings...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="text-center mt-3">Error: {error}</Alert>;
  }

  return (
    <Card className="shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
      <Card.Body>
        <Table striped bordered hover responsive className="mb-0">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Bananas</th>
            </tr>
          </thead>
          <tbody>
            {rankings.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center text-muted">No players in rankings yet.</td>
              </tr>
            ) : (
              rankings.map((player, index) => (
                <tr key={player._id}>
                  <td>#{index + 1}</td>
                  <td>{player.username}</td>
                  <td className="text-warning fw-bold">{player.bananaCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default RankPage;