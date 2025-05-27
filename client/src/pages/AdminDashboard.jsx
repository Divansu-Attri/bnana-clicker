import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalUsername, setModalUsername] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalRole, setModalRole] = useState('player');
  const [isLoading, setIsLoading] = useState(false);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToDeleteName, setUserToDeleteName] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    if (socket) {
      socket.on('userStatusUpdate', (updatedUser) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === updatedUser._id ? { ...user, isActive: updatedUser.isActive } : user
          )
        );
      });

      socket.on('bananaCountUpdate', (updatedUser) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === updatedUser._id ? { ...user, bananaCount: updatedUser.bananaCount } : user
          )
        );
      });

      socket.on('userUpdate', (updatedUser) => {
        setUsers((prevUsers) => {
          const existingUser = prevUsers.find(u => u._id === updatedUser._id);
          if (existingUser) {
            return prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u);
          } else {
            return [...prevUsers, updatedUser];
          }
        });
      });

      socket.on('userDeleted', (userId) => {
        setUsers((prevUsers) => prevUsers.filter(u => u._id !== userId));
      });

      return () => {
        socket.off('userStatusUpdate');
        socket.off('bananaCountUpdate');
        socket.off('userUpdate');
        socket.off('userDeleted');
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, socket]);

  const handleBlockUnblock = async (userId, isBlocked) => {
    try {
      const response = await fetch(`${backendUrl}/api/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isBlocked: !isBlocked } : user
          )
        );
      } else {
        throw new Error(data.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Block/Unblock error:', error);
      setMessage(error.message);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user._id);
    setUserToDeleteName(user.username);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirmModal(false);
    if (!userToDelete) return;

    try {
      const response = await fetch(`${backendUrl}/api/users/${userToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userToDelete));
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      setMessage(error.message);
    } finally {
      setUserToDelete(null);
      setUserToDeleteName('');
    }
  };

  const openCreateModal = () => {
    setCurrentUser(null);
    setModalUsername('');
    setModalPassword('');
    setModalRole('player');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setModalUsername(user.username);
    setModalPassword('');
    setModalRole(user.role);
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      let response;
      if (currentUser) {
        const body = { username: modalUsername, role: modalRole };
        if (modalPassword) body.password = modalPassword;
        response = await fetch(`${backendUrl}/api/users/${currentUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      } else {
        response = await fetch(`${backendUrl}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: modalUsername, password: modalPassword, role: modalRole }),
        });
      }
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setShowModal(false);
        fetchUsers();
      } else {
        throw new Error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('User management modal error:', error);
      setMessage(error.message);
    }
  };

  return (
    <Container className="my-4">
      <h2 className="text-center mb-4">Admin Dashboard</h2>

      {message && (
        <Alert variant="info" className="mb-4">
          {message}
        </Alert>
      )}

      <div className="d-flex justify-content-end mb-3">
        <Button variant="success" onClick={openCreateModal}>
          <i className="bi bi-plus-circle me-2"></i> Add New Player
        </Button>
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading users...</span>
          </Spinner>
          <p className="ms-3 text-muted">Loading users...</p>
        </div>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <Table striped bordered hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Bananas</th>
                  <th>Status</th>
                  <th>Blocked</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">No users found.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td className="text-capitalize">{user.role}</td>
                      <td>{user.bananaCount}</td>
                      <td>
                        <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.isBlocked ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {user.isBlocked ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant={user.isBlocked ? 'primary' : 'warning'}
                          size="sm"
                          className="me-2"
                          onClick={() => handleBlockUnblock(user._id, user.isBlocked)}
                        >
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </Button>
                        <Button variant="info" size="sm" className="me-2" onClick={() => openEditModal(user)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteClick(user)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{currentUser ? 'Edit User' : 'Create New User'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleModalSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="modalUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={modalUsername}
                onChange={(e) => setModalUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="modalPassword">
              <Form.Label>Password {currentUser ? '(Leave blank to keep current)' : ''}</Form.Label>
              <Form.Control
                type="password"
                value={modalPassword}
                onChange={(e) => setModalPassword(e.target.value)}
                {...(!currentUser && { required: true })}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="modalRole">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={modalRole}
                onChange={(e) => setModalRole(e.target.value)}
                required
              >
                <option value="player">Player</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {currentUser ? 'Update User' : 'Create User'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <DeleteConfirmationModal
        show={showDeleteConfirmModal}
        handleClose={() => setShowDeleteConfirmModal(false)}
        handleConfirm={confirmDelete}
        username={userToDeleteName}
      />
    </Container>
  );
};

export default AdminDashboard;