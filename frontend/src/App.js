import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  AppBar, Toolbar, Typography, Box, Drawer, List, ListItem,
  ListItemIcon, ListItemText, IconButton, CssBaseline, Chip, useMediaQuery
} from '@mui/material';
import {
  TrendingUp, PeopleAlt, Warehouse, Grade, Dashboard,
  Chat, Menu, Agriculture, Close
} from '@mui/icons-material';

import PriceForecast from './pages/PriceForecast';
import BuyerMatching from './pages/BuyerMatching';
import StorageAdvisor from './pages/StorageAdvisor';
import QualityGrading from './pages/QualityGrading';
import IncomeDashboard from './pages/IncomeDashboard';
import OrchestratorChat from './pages/OrchestratorChat';
import Home from './pages/Home';

const theme = createTheme({
  palette: {
    primary: { main: '#1B5E20', light: '#2E7D32', dark: '#145214' },
    secondary: { main: '#F57F17', light: '#F9A825', dark: '#E65100' },
    background: { default: '#F0F7F0', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: "'Inter', 'Noto Sans Gujarati', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8, fontWeight: 600 },
        contained: { boxShadow: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 16 },
      },
    },
  },
});

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Home', labelGuj: 'મુખ્ય', path: '/', icon: <Agriculture /> },
  { label: 'Price Forecast', labelGuj: 'ભાવ અનુમાન', path: '/price-forecast', icon: <TrendingUp /> },
  { label: 'Find Buyers', labelGuj: 'ખરીદનાર શોધો', path: '/buyer-matching', icon: <PeopleAlt /> },
  { label: 'Storage Advisor', labelGuj: 'સ્ટોરેજ સલાહ', path: '/storage-advisor', icon: <Warehouse /> },
  { label: 'Quality Grading', labelGuj: 'ગુણવત્તા ગ્રેડ', path: '/quality-grading', icon: <Grade /> },
  { label: 'My Income', labelGuj: 'મારી આવક', path: '/income-dashboard', icon: <Dashboard /> },
  { label: 'AI Assistant', labelGuj: 'AI સહાયક', path: '/ai-chat', icon: <Chat /> },
];

function NavDrawer({ open, onClose, mobile }) {
  const location = useLocation();

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%', background: 'linear-gradient(180deg, #1B5E20 0%, #2E7D32 100%)', color: 'white' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Agriculture sx={{ fontSize: 36, color: '#A5D6A7' }} />
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
              KhedutMitra AI
            </Typography>
            <Typography variant="caption" sx={{ color: '#A5D6A7', fontFamily: "'Noto Sans Gujarati', sans-serif" }}>
              ખેડૂત મિત્ર AI
            </Typography>
          </Box>
        </Box>
        <Chip
          label="Powered by IBM Granite"
          size="small"
          sx={{ mt: 1.5, backgroundColor: 'rgba(255,255,255,0.15)', color: '#E8F5E9', fontSize: 10 }}
        />
      </Box>
      <List sx={{ pt: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={mobile ? onClose : undefined}
              sx={{
                mx: 1.5, my: 0.3, borderRadius: 2,
                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                textDecoration: 'none',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' },
                transition: 'background 0.2s',
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#FFD54F' : '#A5D6A7', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.labelGuj}
                primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: 14 }}
                secondaryTypographyProps={{ color: '#A5D6A7', fontSize: 11, fontFamily: "'Noto Sans Gujarati', sans-serif" }}
              />
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', px: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
          Challenge 13 • IBM Hackathon 2024{'\n'}
          IBM Granite LLM + watsonx.ai
        </Typography>
      </Box>
    </Box>
  );

  if (mobile) {
    return (
      <Drawer anchor="left" open={open} onClose={onClose} PaperProps={{ sx: { border: 'none' } }}>
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      PaperProps={{ sx: { border: 'none', width: DRAWER_WIDTH } }}
    >
      {drawerContent}
    </Drawer>
  );
}

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {!isMobile && <NavDrawer open={true} onClose={() => {}} mobile={false} />}
      {isMobile && (
        <NavDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} mobile={true} />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
          minHeight: '100vh',
          background: '#F0F7F0',
        }}
      >
        {isMobile && (
          <AppBar position="sticky" sx={{ background: '#1B5E20', boxShadow: 'none' }}>
            <Toolbar>
              <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
                <Menu />
              </IconButton>
              <Agriculture sx={{ ml: 1, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>KhedutMitra AI</Typography>
            </Toolbar>
          </AppBar>
        )}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/price-forecast" element={<PriceForecast />} />
            <Route path="/buyer-matching" element={<BuyerMatching />} />
            <Route path="/storage-advisor" element={<StorageAdvisor />} />
            <Route path="/quality-grading" element={<QualityGrading />} />
            <Route path="/income-dashboard" element={<IncomeDashboard />} />
            <Route path="/ai-chat" element={<OrchestratorChat />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppLayout />
      </Router>
    </ThemeProvider>
  );
}
