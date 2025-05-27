import React, { useState, useContext } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login, register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        const success = await register(username, password);
        if (success) {
          setMessage('Registration successful! Please log in.');
          setIsLogin(true);
        }
      }
    } catch (error) {
      setMessage(error.message || 'An error occurred.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card className="shadow-lg border-0" style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Register'}</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-3">
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </Form>
          {message && (
            <Alert variant={message.includes('successful') ? 'success' : 'danger'} className="mt-3 text-center">
              {message}
            </Alert>
          )}
          <p className="text-center mt-3 text-muted">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <Button variant="link" onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
            }}>
              {isLogin ? 'Register here' : 'Login here'}
            </Button>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};
