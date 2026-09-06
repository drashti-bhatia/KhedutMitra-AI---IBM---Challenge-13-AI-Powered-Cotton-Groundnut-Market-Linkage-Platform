import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Grid, Chip, CircularProgress, Alert, Paper, Divider, LinearProgress
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat, Info } from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';
import { priceForecastAPI } from '../services/api';
import toast from 'react-hot-toast';

const CROPS = ['cotton', 'groundnut'];
const MANDIS = ['Rajkot', 'Junagadh', 'Surendranagar', 'Gondal', 'Amreli'];
const DAYS_OPTIONS = [7, 15, 30];

const MSP_INFO = {
  cotton: '₹7,020/quintal (Medium Staple)',
  groundnut: '₹6,377/quintal (In-Shell)',
};

export default function PriceForecast() {
  const [form, setForm] = useState({ crop: 'groundnut', mandi: 'Rajkot', forecast_days: 7 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await priceForecastAPI(form);
      setResult(res.data);
      toast.success('Forecast generated successfully!');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to get forecast. Is the backend running?';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const trendIcon = result
    ? result.trend === 'RISING' ? <TrendingUp color="success" />
      : result.trend === 'FALLING' ? <TrendingDown color="error" />
      : <TrendingFlat color="warning" />
    : null;

  const chartData = result
    ? [
        { date: 'Current', price: result.last_known_price, type: 'actual' },
        ...(result.forecast || []).map(f => ({
          date: f.date.slice(5),
          price: f.predicted_price,
          type: 'forecast',
        })),
      ]
    : [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main">
          📈 Mandi Price Forecast
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          ભાવ અનુમાન — AI-powered price prediction for your crop
        </Typography>
      </Box>

      {/* Input Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Select Crop & Mandi
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth label="Crop / પાક"
                value={form.crop}
                onChange={e => setForm({ ...form, crop: e.target.value })}
              >
                {CROPS.map(c => (
                  <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth label="Mandi / મંડી"
                value={form.mandi}
                onChange={e => setForm({ ...form, mandi: e.target.value })}
              >
                {MANDIS.map(m => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth label="Forecast Period / અવધિ"
                value={form.forecast_days}
                onChange={e => setForm({ ...form, forecast_days: e.target.value })}
              >
                {DAYS_OPTIONS.map(d => (
                  <MenuItem key={d} value={d}>{d} Days</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <Info sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              MSP Reference — {form.crop.charAt(0).toUpperCase() + form.crop.slice(1)}: {MSP_INFO[form.crop]}
            </Typography>
          </Box>
          <Button
            variant="contained" size="large" onClick={handleSubmit}
            disabled={loading} sx={{ mt: 2 }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <TrendingUp />}
          >
            {loading ? 'Forecasting…' : 'Get AI Forecast'}
          </Button>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {result && (
        <Box>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ background: '#E8F5E9', border: '1px solid #A5D6A7' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Current Price</Typography>
                  <Typography variant="h4" fontWeight={800} color="#1B5E20">
                    ₹{result.last_known_price?.toLocaleString()}
                  </Typography>
                  <Typography variant="caption">per quintal</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{
                background: result.trend === 'RISING' ? '#E8F5E9' : result.trend === 'FALLING' ? '#FFEBEE' : '#FFF8E1',
                border: `1px solid ${result.trend === 'RISING' ? '#A5D6A7' : result.trend === 'FALLING' ? '#FFCDD2' : '#FFE082'}`
              }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Trend ({result.forecast_days}d)</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {trendIcon}
                    <Typography variant="h5" fontWeight={800}>
                      {result.trend} ({result.trend_pct > 0 ? '+' : ''}{result.trend_pct}%)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ background: '#E3F2FD', border: '1px solid #90CAF9' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">MSP Floor</Typography>
                  <Typography variant="h5" fontWeight={800} color="#1565C0">
                    ₹{result.msp_reference?.toLocaleString()}
                  </Typography>
                  <Typography variant="caption">Government Support Price</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Chart */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Price Forecast Chart — {result.crop} @ {result.mandi}
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={v => [`₹${v}/quintal`, 'Price']} />
                  {result.msp_reference && (
                    <ReferenceLine y={result.msp_reference} stroke="#F57F17" strokeDasharray="5 5" label={{ value: 'MSP', fill: '#F57F17', fontSize: 12 }} />
                  )}
                  <Area type="monotone" dataKey="price" stroke="#2E7D32" fill="url(#colorPrice)" strokeWidth={2.5} dot={{ fill: '#1B5E20', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Drivers */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    📊 Key Price Drivers
                  </Typography>
                  {result.key_drivers?.map((d, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'flex-start' }}>
                      <Chip label={i + 1} size="small" color="primary" sx={{ minWidth: 28, height: 24, mt: 0.2 }} />
                      <Typography variant="body2">{d}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ background: '#E8F5E9', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                    🤖 IBM Granite AI Insight
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7, fontStyle: 'italic', color: '#2E7D32' }}>
                    "{result.llm_explanation}"
                  </Typography>
                  <Box sx={{ mt: 1.5 }}>
                    <Chip label={`Confidence: ${(result.confidence * 100).toFixed(0)}%`} size="small" color="success" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Forecast Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Detailed Forecast
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#E8F5E9' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #C8E6C9' }}>Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #C8E6C9' }}>Predicted Price</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #C8E6C9' }}>vs Current</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #C8E6C9' }}>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.forecast?.map((f, i) => {
                      const diff = f.predicted_price - result.last_known_price;
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #F1F8E9' }}>
                          <td style={{ padding: '7px 12px' }}>{f.date}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 600 }}>
                            ₹{f.predicted_price.toLocaleString()}
                          </td>
                          <td style={{ padding: '7px 12px', textAlign: 'right', color: diff > 0 ? '#2E7D32' : diff < 0 ? '#C62828' : '#666' }}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(0)}
                          </td>
                          <td style={{ padding: '7px 12px', textAlign: 'right', color: '#666' }}>
                            {(f.confidence * 100).toFixed(0)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Alert severity="warning" sx={{ mt: 2 }} icon={<Info />}>
            {result.disclaimer}
          </Alert>
        </Box>
      )}
    </Box>
  );
}
