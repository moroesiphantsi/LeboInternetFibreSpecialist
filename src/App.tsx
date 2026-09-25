import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import { Container } from '@mui/material';

const App: React.FC = () => {
 

  return (
    <Container>
      <Router>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <Routes>
              {/* Home Page */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </Container>
  );
};

export default App;
