// import React, { useContext } from 'react';
// import { Outlet } from 'react-router-dom';
// import { Container, Navbar, Nav, Button } from 'react-bootstrap';
// import { AuthContext } from '../contexts/AuthContext'; // Import AuthContext
// import { SocketContext } from '../contexts/SocketContext'; // Import SocketContext

// const Layout = () => {
//   const { user, logout } = useContext(AuthContext);
//   const { isConnected } = useContext(SocketContext);

//   return (
//     <div className="d-flex flex-column min-vh-100 bg-light">
//       <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm rounded-bottom">
//         <Container>
//           <Navbar.Brand href="/">Banana Clicker Dashboard</Navbar.Brand>
//           <Navbar.Toggle aria-controls="basic-navbar-nav" />
//           <Navbar.Collapse id="basic-navbar-nav">
//             <Nav className="ms-auto align-items-center">
//               {user && (
//                 <>
//                   <Nav.Text className="me-3">
//                     Welcome, {user.username} ({user.role})
//                   </Nav.Text>
//                   <span
//                     className={`d-inline-block rounded-circle me-3 ${isConnected ? 'bg-success' : 'bg-danger'}`}
//                     style={{ width: '10px', height: '10px' }}
//                     title={isConnected ? 'Socket Connected' : 'Socket Disconnected'}
//                   ></span>
//                   <Button variant="danger" onClick={logout}>
//                     Logout
//                   </Button>
//                 </>
//               )}
//             </Nav>
//           </Navbar.Collapse>
//         </Container>
//       </Navbar>
//       <main className="flex-grow-1 p-4">
//         <Outlet /> {/* Renders child routes */}
//       </main>
//       <footer className="bg-dark text-white p-3 text-center text-sm rounded-top">
//         &copy; {new Date().getFullYear()} Banana Clicker App. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default Layout;

import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const { isConnected } = useContext(SocketContext);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm rounded-bottom">
        <Container>
          <Navbar.Brand href="/">Banana Clicker Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {user && (
                <>
                  <Navbar.Text className="me-3">
                    Welcome, {user.username} ({user.role})
                  </Navbar.Text>
                  <span
                    className={`d-inline-block rounded-circle me-3 ${
                      isConnected ? 'bg-success' : 'bg-danger'
                    }`}
                    style={{ width: '10px', height: '10px' }}
                    title={isConnected ? 'Socket Connected' : 'Socket Disconnected'}
                  ></span>
                  <Button variant="danger" onClick={logout}>
                    Logout
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1 p-4">
        <Outlet /> {/* Renders child routes */}
      </main>

      <footer className="bg-dark text-white p-3 text-center text-sm rounded-top">
        &copy; {new Date().getFullYear()} Banana Clicker App. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
