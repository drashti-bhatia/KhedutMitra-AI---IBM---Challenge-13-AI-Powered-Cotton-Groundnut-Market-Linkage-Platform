import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Grid, Chip, CircularProgress, Alert, LinearProgress, Avatar, Divider
} from '@mui/material';
import {
  Dashboard, TrendingUp, TrendingDown, AccountBalanceWallet,
  CheckCircle, Analytics
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, Cell
} from 'recharts';
import { incomeDashboardAPI, getFarmersAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function IncomeDashboard() {
  const [farmerId, setFarmerId] = useState('F001');
  const [farmers, setFarmers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getFarmersAPI().then(res => setFarmers(res.data.farmers || [])).catch(() => {});
  }, []);

  const handleLoad = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await incomeDashboardAPI(farmerId);
      setResult(res.data);
      toast.success(`Loaded dashboard for ${res.data.farmer_name}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to load dashboard. Is the backend running?';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main">
          📊 Farmer Income Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          મારી આવક — Track your earnings and compare vs. mandi average
        </Typography>
      </Box>

      {/* Farmer Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Select Farmer</Typography>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <TextField select fullWidth label="Farmer ID"
                value={farmerId} onChange={e => setFarmerId(e.target.value)}>
                {farmers.length > 0
                  ? farmers.map(f => (
                    <MenuItem key={f.farmer_id} value={f.farmer_id}>
                      {f.farmer_id} — {f.name} ({f.district})
                    </MenuItem>
                  ))
                  : ['F001', 'F002', 'F003', 'F004', 'F005'].map(id => (
                    <MenuItem key={id} value={id}>{id}</MenuItem>
                  ))
                }
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="contained" size="large" fullWidth onClick={handleLoad}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Dashboard />}>
                {loading ? 'Loading…' : 'Load Dashboard'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {result && (
        <Box>
          {/* Farmer Profile */}
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1B5E20, #43A047)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 60, height: 60, background: 'rgba(255,255,255,0.2)', fontSize: 26, fontWeight: 700 }}>
                  {result.farmer_name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800}>{result.farmer_name}</Typography>
                  <Typography sx={{ color: '#A5D6A7' }}>
                    {result.farmer_district} • ID: {result.farmer_id}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2, background: 'rgba(255,255,255,0.12)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.2)' }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                  <Analytics sx={{ color: '#FFD54F' }} />
                  <Typography variant="body1" fontWeight={600} sx={{ color: '#FFD54F' }}>
                    IBM Granite AI Insight
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#E8F5E9', lineHeight: 1.6 }}>
                  "{result.llm_insight}"
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AccountBalanceWallet sx={{ fontSize: 32, color: '#1B5E20', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Total Income</Typography>
                  <Typography variant="h5" fontWeight={800} color="primary.main">
                    ₹{result.summary?.total_income?.toLocaleString()}
                  </Typography>
                  <Typography variant="caption">{result.summary?.total_quantity_quintal} quintals</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  {result.summary?.avg_vs_mandi_pct >= 0
                    ? <TrendingUp sx={{ fontSize: 32, color: '#2E7D32', mb: 1 }} />
                    : <TrendingDown sx={{ fontSize: 32, color: '#C62828', mb: 1 }} />}
                  <Typography variant="caption" color="text.secondary" display="block">vs. Mandi Avg</Typography>
                  <Typography variant="h5" fontWeight={800}
                    color={result.summary?.avg_vs_mandi_pct >= 0 ? 'success.main' : 'error.main'}>
                    {result.summary?.avg_vs_mandi_pct > 0 ? '+' : ''}{result.summary?.avg_vs_mandi_pct?.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 32, color: '#1565C0', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Savings (vs Mandi)</Typography>
                  <Typography variant="h5" fontWeight={800} color="primary">
                    ₹{result.summary?.total_savings_vs_mandi?.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Analytics sx={{ fontSize: 32, color: '#6A1B9A', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Direct Sales</Typography>
                  <Typography variant="h5" fontWeight={800} color="#6A1B9A">
                    {result.summary?.direct_sales_count}/{result.summary?.total_transactions}
                  </Typography>
                  <Typography variant="caption">{result.summary?.direct_sales_pct}% direct</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Crop Breakdown */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Income by Crop
                  </Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.crop_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                      <XAxis dataKey="crop" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={v => [`₹${v?.toLocaleString()}`, '']} />
                      <Bar dataKey="total_income" name="Total Income" radius={[4, 4, 0, 0]}>
                        {result.crop_breakdown?.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? '#2E7D32' : '#1565C0'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Price Comparison */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Price: Realized vs. Mandi Average
                  </Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.crop_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                      <XAxis dataKey="crop" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={v => `₹${v}`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={v => [`₹${v?.toFixed(0)}`, '']} />
                      <Legend />
                      <Bar dataKey="avg_price" name="Your Price" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Transaction History */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Transaction History</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#E8F5E9' }}>
                      {['Date', 'Crop', 'Qty (Q)', 'Price', 'Mandi Avg', 'vs Mandi', 'Income', 'Savings', 'Direct'].map(h => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Date' || h === 'Crop' ? 'left' : 'right', borderBottom: '2px solid #C8E6C9', fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.transactions?.map((t, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F8E9' }}>
                        <td style={{ padding: '6px 10px' }}>{t.date}</td>
                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>{t.crop}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'right' }}>{t.quantity}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>₹{t.price_realized}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', color: '#666' }}>₹{t.mandi_avg_price}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', color: t.vs_mandi_pct >= 0 ? '#2E7D32' : '#C62828', fontWeight: 600 }}>
                          {t.vs_mandi_pct > 0 ? '+' : ''}{t.vs_mandi_pct?.toFixed(1)}%
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right' }}>₹{t.income?.toLocaleString()}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', color: t.savings >= 0 ? '#2E7D32' : '#C62828' }}>
                          {t.savings >= 0 ? '+' : ''}₹{t.savings?.toLocaleString()}
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                          {t.direct_sale ? '✅' : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
