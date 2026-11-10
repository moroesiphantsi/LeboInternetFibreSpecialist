import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from '@mui/material';

// Scales headings down automatically on small screens and keeps
// tap targets (buttons, inputs, icon buttons) at a comfortable size.
let theme = createTheme({
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { minHeight: 44 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { minWidth: 44, minHeight: 44 },
      },
    },
    MuiTextField: {
      defaultProps: { fullWidth: true },
    },
  },
});
theme = responsiveFontSizes(theme);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      {/* Resets browser defaults and applies the theme's base styles */}
      <CssBaseline />
      <Router>
        <Box
          component="main"
          sx={{
            minHeight: '100dvh', // dvh accounts for mobile browser address bars
            overflowX: 'hidden', // prevents accidental sideways scrolling
            // Keeps content clear of notches and home indicators
            pt: 'env(safe-area-inset-top)',
            pb: 'env(safe-area-inset-bottom)',
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              // Tighter side padding on phones, roomier on larger screens
              px: { xs: 1.5, sm: 3, md: 4 },
              py: { xs: 2, sm: 3 },
            }}
          >
            <Routes>
              {/* Home Page */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
