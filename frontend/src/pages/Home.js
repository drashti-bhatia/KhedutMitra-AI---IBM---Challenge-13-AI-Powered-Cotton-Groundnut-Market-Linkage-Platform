import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Paper
} from '@mui/material';
import {
  TrendingUp, PeopleAlt, Warehouse, Grade, Dashboard,
  Chat, Agriculture, CheckCircle, Info
} from '@mui/icons-material';

const features = [
  {
    title: 'Mandi Price Forecast',
    titleGuj: 'ભાવ અનુમાન',
    desc: 'AI-powered 7/15/30-day price predictions for cotton & groundnut across Gujarat mandis.',
    path: '/price-forecast',
    icon: <TrendingUp sx={{ fontSize: 36 }} />,
    color: '#1565C0',
    bg: '#E3F2FD',
  },
  {
    title: 'Find Direct Buyers',
    titleGuj: 'ખરીદનાર શોધો',
    desc: 'Get matched with verified ginning mills, oil mills, and exporters — skip the middleman.',
    path: '/buyer-matching',
    icon: <PeopleAlt sx={{ fontSize: 36 }} />,
    color: '#2E7D32',
    bg: '#E8F5E9',
  },
  {
    title: 'Storage Advisor',
    titleGuj: 'સ્ટોરેજ સલાહ',
    desc: 'Know exactly when to sell vs. store — with cost/gain trade-off analysis.',
    path: '/storage-advisor',
    icon: <Warehouse sx={{ fontSize: 36 }} />,
    color: '#E65100',
    bg: '#FFF3E0',
  },
  {
    title: 'Quality Grading',
    titleGuj: 'ગુણવત્તા ગ્રેડ',
    desc: 'Estimate your lot\'s grade (FAQ/A/B) based on moisture and foreign matter content.',
    path: '/quality-grading',
    icon: <Grade sx={{ fontSize: 36 }} />,
    color: '#6A1B9A',
    bg: '#F3E5F5',
  },
  {
    title: 'Income Dashboard',
    titleGuj: 'મારી આવક',
    desc: 'Track your season income, compare vs. mandi average, and see savings from direct deals.',
    path: '/income-dashboard',
    icon: <Dashboard sx={{ fontSize: 36 }} />,
    color: '#00695C',
    bg: '#E0F2F1',
  },
  {
    title: 'AI Assistant',
    titleGuj: 'AI સહાયક',
    desc: 'Chat with KhedutMitra AI in English, Hindi, or Gujarati — get instant answers.',
    path: '/ai-chat',
    icon: <Chat sx={{ fontSize: 36 }} />,
    color: '#C62828',
    bg: '#FFEBEE',
  },
];

const stats = [
  { label: 'Mandis Covered', value: '5+', sublabel: 'Gujarat APMCs' },
  { label: 'Avg Price Uplift', value: '15-30%', sublabel: 'vs. middleman' },
  { label: 'Verified Buyers', value: '12+', sublabel: 'Mills & Exporters' },
  { label: 'AI Agents', value: '5', sublabel: 'Specialized agents' },
];

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
          color: 'white',
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Agriculture sx={{ fontSize: 48, color: '#A5D6A7' }} />
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
                KhedutMitra AI
              </Typography>
              <Typography sx={{ color: '#A5D6A7', fontFamily: "'Noto Sans Gujarati', sans-serif", fontSize: 18 }}>
                ખેડૂત મિત્ર AI
              </Typography>
            </Box>
          </Box>
          <Typography variant="h6" sx={{ color: '#C8E6C9', mb: 1, maxWidth: 600 }}>
            AI-Powered Cotton & Groundnut Market Platform for Gujarat Farmers
          </Typography>
          <Typography sx={{ color: '#A5D6A7', mb: 3, maxWidth: 540, lineHeight: 1.7 }}>
            Get real-time mandi prices, connect directly with buyers, and make smarter
            sell/store decisions — powered by IBM Granite LLM.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <Chip label="IBM Granite LLM" sx={{ bg: 'rgba(255,255,255,0.15)', color: '#FFD54F', borderColor: '#FFD54F', fontWeight: 600 }} variant="outlined" />
            <Chip label="watsonx.ai" sx={{ bg: 'rgba(255,255,255,0.15)', color: '#FFD54F', borderColor: '#FFD54F', fontWeight: 600 }} variant="outlined" />
            <Chip label="Challenge 13 — IBM Hackathon" sx={{ bg: 'rgba(255,255,255,0.15)', color: '#E8F5E9', borderColor: '#A5D6A7', fontWeight: 500 }} variant="outlined" />
          </Box>
          <Button
            component={Link}
            to="/price-forecast"
            variant="contained"
            size="large"
            sx={{ background: '#FFD54F', color: '#1B5E20', '&:hover': { background: '#FFC107' }, fontWeight: 700 }}
          >
            🌾 Get Price Forecast
          </Button>
        </Box>
        {/* Background decoration */}
        <Box sx={{
          position: 'absolute', right: -40, top: -40,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
      </Paper>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={800} color="primary.main">{s.value}</Typography>
              <Typography variant="body2" fontWeight={600}>{s.label}</Typography>
              <Typography variant="caption" color="text.secondary">{s.sublabel}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Features Grid */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: '#1B5E20' }}>
        🤖 AI Agent Features
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {features.map((f) => (
          <Grid item xs={12} sm={6} lg={4} key={f.path}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: f.bg, color: f.color }}>
                    {f.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{f.title}</Typography>
                    <Typography variant="caption" sx={{ color: f.color, fontFamily: "'Noto Sans Gujarati', sans-serif" }}>
                      {f.titleGuj}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {f.desc}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  component={Link}
                  to={f.path}
                  variant="contained"
                  fullWidth
                  sx={{ background: f.color, '&:hover': { background: f.color, opacity: 0.9 } }}
                >
                  Launch Agent →
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Disclaimer */}
      <Paper sx={{ p: 2.5, background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Info sx={{ color: '#F57F17', mt: 0.3 }} />
          <Box>
            <Typography variant="body2" fontWeight={600} color="#E65100">
              Important Disclaimer / મહત્વની નોંધ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Price forecasts and recommendations on this platform are AI-generated and should be treated as
              data-informed guidance, not financial guarantees. Always confirm critical selling decisions with
              your local mandi officials or agri-extension officers. Sample/demo data is used — not a substitute
              for real Agmarknet/eNAM live data in production.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
