import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Grid, Chip, CircularProgress, Alert, Switch, FormControlLabel,
  LinearProgress, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { Warehouse, CheckCircle, Warning, Info, TrendingUp } from '@mui/icons-material';
import { storageAdvisorAPI } from '../services/api';
import toast from 'react-hot-toast';

const CROPS = ['cotton', 'groundnut'];
const MANDIS = ['Rajkot', 'Junagadh', 'Surendranagar', 'Gondal', 'Amreli'];

const RECOMMENDATION_STYLES = {
  SELL_NOW: { color: '#C62828', bg: '#FFEBEE', icon: '⚡', label: 'SELL NOW' },
  SELL_PARTIAL: { color: '#E65100', bg: '#FFF3E0', icon: '⚖️', label: 'SELL PARTIAL' },
};

function getRecommendationStyle(rec) {
  if (!rec) return { color: '#666', bg: '#F5F5F5', icon: '—', label: rec };
  if (rec.startsWith('STORE_')) {
    return { color: '#1B5E20', bg: '#E8F5E9', icon: '🏪', label: rec.replace('_', ' ').replace('_', ' ') };
  }
  return RECOMMENDATION_STYLES[rec] || { color: '#666', bg: '#F5F5F5', icon: '—', label: rec };
}

export default function StorageAdvisor() {
  const [form, setForm] = useState({
    crop: 'groundnut',
    mandi: 'Rajkot',
    quantity_quintal: 100,
    current_price: '',
    urgent_cash_need: false,
    storage_days_available: 30,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        ...form,
        current_price: form.current_price ? parseFloat(form.current_price) : null,
      };
      const res = await storageAdvisorAPI(payload);
      setResult(res.data);
      toast.success('Storage recommendation ready!');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to get advice. Is the backend running?';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const recStyle = result ? getRecommendationStyle(result.recommendation) : null;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main">
          🏪 Storage & Selling Advisor
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          સ્ટોરેજ સલાહ — Sell now or store? AI will calculate the best option.
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Lot & Situation Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth label="Crop / પાક"
                value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })}>
                {CROPS.map(c => <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth label="Mandi / મંડી"
                value={form.mandi} onChange={e => setForm({ ...form, mandi: e.target.value })}>
                {MANDIS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Quantity (Quintals)" type="number"
                value={form.quantity_quintal}
                onChange={e => setForm({ ...form, quantity_quintal: parseFloat(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Current Price (₹, optional)" type="number"
                value={form.current_price}
                placeholder="Auto-fetch if blank"
                onChange={e => setForm({ ...form, current_price: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Storage Available (days)" type="number"
                value={form.storage_days_available}
                onChange={e => setForm({ ...form, storage_days_available: parseInt(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.urgent_cash_need}
                    onChange={e => setForm({ ...form, urgent_cash_need: e.target.checked })}
                    color="warning"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>Urgent Cash Need?</Typography>
                    <Typography variant="caption" color="text.secondary">Need money now</Typography>
                  </Box>
                }
              />
            </Grid>
          </Grid>
          <Button variant="contained" size="large" onClick={handleSubmit}
            disabled={loading} sx={{ mt: 2 }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Warehouse />}>
            {loading ? 'Calculating…' : 'Get Storage Advice'}
          </Button>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {result && (
        <Box>
          {/* Recommendation Banner */}
          <Card sx={{ mb: 3, background: recStyle.bg, border: `2px solid ${recStyle.color}30` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h1" sx={{ fontSize: 48 }}>{recStyle.icon}</Typography>
                <Box>
                  <Typography variant="overline" color="text.secondary">AI Recommendation</Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: recStyle.color }}>
                    {recStyle.label}
                  </Typography>
                  {result.recommended_storage_days > 0 && (
                    <Typography variant="body1" fontWeight={600} color={recStyle.color}>
                      Store for {result.recommended_storage_days} days before selling
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ p: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.7, color: '#2E7D32' }}>
                  🤖 "{result.llm_advice}"
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Summary */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Current Price</Typography>
                  <Typography variant="h5" fontWeight={800} color="primary">₹{result.current_price?.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Price Trend</Typography>
                  <Typography variant="h5" fontWeight={800}
                    color={result.price_trend === 'RISING' ? 'success.main' : result.price_trend === 'FALLING' ? 'error.main' : 'warning.main'}>
                    {result.price_trend} ({result.trend_pct > 0 ? '+' : ''}{result.trend_pct}%)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Quantity</Typography>
                  <Typography variant="h5" fontWeight={800}>{result.quantity_quintal} Q</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Cash Urgency</Typography>
                  <Typography variant="h5" fontWeight={800}
                    color={result.urgent_cash_need ? 'warning.main' : 'success.main'}>
                    {result.urgent_cash_need ? 'URGENT' : 'Flexible'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Storage Analysis Table */}
          {result.storage_analysis?.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  📊 Storage Trade-off Analysis
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead sx={{ background: '#E8F5E9' }}>
                      <TableRow>
                        <TableCell><strong>Storage Period</strong></TableCell>
                        <TableCell align="right"><strong>Forecast Price</strong></TableCell>
                        <TableCell align="right"><strong>Price Gain/Q</strong></TableCell>
                        <TableCell align="right"><strong>Storage Cost/Q</strong></TableCell>
                        <TableCell align="right"><strong>Net Benefit/Q</strong></TableCell>
                        <TableCell align="right"><strong>Total Net</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.storage_analysis.map((row, i) => {
                        const isBest = row.net_benefit_per_quintal === Math.max(...result.storage_analysis.map(r => r.net_benefit_per_quintal));
                        return (
                          <TableRow key={i} sx={{ background: isBest ? '#F1F8E9' : 'transparent' }}>
                            <TableCell>
                              <strong>{row.days} days</strong>
                              {isBest && <Chip label="Best" size="small" color="success" sx={{ ml: 1 }} />}
                            </TableCell>
                            <TableCell align="right">₹{row.forecast_price?.toLocaleString()}</TableCell>
                            <TableCell align="right" sx={{ color: row.price_gain_per_quintal > 0 ? '#2E7D32' : '#C62828' }}>
                              {row.price_gain_per_quintal > 0 ? '+' : ''}₹{row.price_gain_per_quintal}
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#C62828' }}>
                              -₹{row.total_cost_per_quintal}
                            </TableCell>
                            <TableCell align="right" sx={{ color: row.net_benefit_per_quintal > 0 ? '#2E7D32' : '#C62828', fontWeight: 700 }}>
                              {row.net_benefit_per_quintal > 0 ? '+' : ''}₹{row.net_benefit_per_quintal}
                            </TableCell>
                            <TableCell align="right" sx={{ color: row.net_benefit_total > 0 ? '#2E7D32' : '#C62828', fontWeight: 700 }}>
                              {row.net_benefit_total > 0 ? '+' : ''}₹{row.net_benefit_total?.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Storage cost: ₹{result.storage_params?.cost_per_quintal_per_day}/quintal/day •
                  Spoilage risk: {result.storage_params?.spoilage_rate_per_week_pct}%/week •
                  Max safe storage: {result.storage_params?.max_safe_storage_days} days
                </Typography>
              </CardContent>
            </Card>
          )}

          <Alert severity="info" sx={{ mt: 1 }}>{result.disclaimer}</Alert>
        </Box>
      )}
    </Box>
  );
}
