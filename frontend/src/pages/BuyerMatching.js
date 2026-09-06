import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Grid, Chip, CircularProgress, Alert, Avatar, LinearProgress,
  Rating, Divider
} from '@mui/material';
import { PeopleAlt, Phone, LocationOn, Star, Business } from '@mui/icons-material';
import { buyerMatchAPI } from '../services/api';
import toast from 'react-hot-toast';

const CROPS = ['cotton', 'groundnut'];
const DISTRICTS = ['Rajkot', 'Junagadh', 'Surendranagar', 'Amreli', 'Ahmedabad', 'Bhavnagar', 'Morbi', 'Surat'];
const GRADES = ['FAQ', 'Premium', 'Grade A', 'Grade B', 'Grade C'];

const BUYER_TYPE_COLORS = {
  ginning_mill: '#1565C0',
  oil_mill: '#2E7D32',
  exporter: '#6A1B9A',
  fpo: '#E65100',
  trader: '#37474F',
};

const BUYER_TYPE_LABELS = {
  ginning_mill: 'Ginning Mill',
  oil_mill: 'Oil Mill',
  exporter: 'Exporter',
  fpo: 'FPO/Cooperative',
  trader: 'Trader',
};

export default function BuyerMatching() {
  const [form, setForm] = useState({
    crop: 'groundnut',
    quantity_quintal: 100,
    quality_grade: 'FAQ',
    farmer_district: 'Rajkot',
    min_acceptable_price: 5500,
    farmer_name: 'Bhavesh Patel',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await buyerMatchAPI(form);
      setResult(res.data);
      toast.success(`Found ${res.data.matches?.length || 0} buyer matches!`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to find buyers. Is the backend running?';
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
          🤝 Find Direct Buyers
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          ખરીદનાર શોધો — Skip middlemen, connect directly with verified buyers
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Your Lot Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField select fullWidth label="Crop / પાક"
                value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })}>
                {CROPS.map(c => <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Quantity (Quintals)" type="number"
                value={form.quantity_quintal}
                onChange={e => setForm({ ...form, quantity_quintal: parseFloat(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField select fullWidth label="Quality Grade"
                value={form.quality_grade} onChange={e => setForm({ ...form, quality_grade: e.target.value })}>
                {GRADES.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField select fullWidth label="Your District / જિલ્લો"
                value={form.farmer_district} onChange={e => setForm({ ...form, farmer_district: e.target.value })}>
                {DISTRICTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Min Acceptable Price (₹/quintal)" type="number"
                value={form.min_acceptable_price}
                onChange={e => setForm({ ...form, min_acceptable_price: parseFloat(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Your Name (for negotiation)"
                value={form.farmer_name}
                onChange={e => setForm({ ...form, farmer_name: e.target.value })} />
            </Grid>
          </Grid>
          <Button variant="contained" size="large" onClick={handleSubmit}
            disabled={loading} sx={{ mt: 2 }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PeopleAlt />}>
            {loading ? 'Finding Buyers…' : 'Find Matching Buyers'}
          </Button>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {result && (
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: '#1B5E20' }}>
            🎯 Top {result.matches?.length} Buyer Matches
          </Typography>

          {result.matches?.map((buyer, i) => (
            <Card key={buyer.buyer_id} sx={{
              mb: 2.5,
              border: i === 0 ? '2px solid #2E7D32' : '1px solid #E0E0E0',
              position: 'relative',
              overflow: 'visible',
            }}>
              {i === 0 && (
                <Chip label="⭐ Best Match" color="success" size="small"
                  sx={{ position: 'absolute', top: -12, left: 16, fontWeight: 700 }} />
              )}
              <CardContent>
                <Grid container spacing={2} alignItems="flex-start">
                  {/* Buyer Info */}
                  <Grid item xs={12} md={5}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Avatar sx={{
                        width: 52, height: 52,
                        background: BUYER_TYPE_COLORS[buyer.buyer_type] || '#666',
                        fontSize: 20,
                      }}>
                        {buyer.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>{buyer.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">{buyer.company}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {buyer.location} • {buyer.distance_km} km away
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={BUYER_TYPE_LABELS[buyer.buyer_type] || buyer.buyer_type}
                            size="small"
                            sx={{ background: BUYER_TYPE_COLORS[buyer.buyer_type] + '20', color: BUYER_TYPE_COLORS[buyer.buyer_type], fontWeight: 600, fontSize: 11 }}
                          />
                          <Chip
                            icon={<Star sx={{ fontSize: 12 }} />}
                            label={`${buyer.reliability_score}/5`}
                            size="small"
                            color={buyer.reliability_score >= 4.5 ? 'success' : 'default'}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Price & Match Score */}
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, background: '#E8F5E9', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Price Offered</Typography>
                      <Typography variant="h4" fontWeight={800} color="#1B5E20">
                        ₹{buyer.price_offered.toLocaleString()}
                      </Typography>
                      <Chip
                        label={`+₹${buyer.price_premium_above_min} (${buyer.price_premium_pct}% above min)`}
                        size="small" color="success" sx={{ mt: 0.5, fontSize: 10 }}
                      />
                    </Box>
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Match Score</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={buyer.match_score * 100}
                        sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                        color={i === 0 ? 'success' : 'primary'}
                      />
                      <Typography variant="caption" fontWeight={700}>
                        {(buyer.match_score * 100).toFixed(0)}% match
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Negotiation Message */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      🤖 AI Negotiation Starter (IBM Granite)
                    </Typography>
                    <Box sx={{ p: 1.5, background: '#F3E5F5', borderRadius: 2, border: '1px solid #CE93D8' }}>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.6, color: '#4A148C' }}>
                        "{buyer.negotiation_starter}"
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                      <Button
                        variant="outlined" size="small"
                        startIcon={<Phone />}
                        href={`tel:${buyer.contact_phone}`}
                        sx={{ borderColor: '#2E7D32', color: '#2E7D32' }}
                      >
                        {buyer.contact_phone}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">
                  <strong>Why this match:</strong> {buyer.reason}
                </Typography>
              </CardContent>
            </Card>
          ))}

          <Alert severity="info" sx={{ mt: 1 }}>{result.note}</Alert>
        </Box>
      )}
    </Box>
  );
}
