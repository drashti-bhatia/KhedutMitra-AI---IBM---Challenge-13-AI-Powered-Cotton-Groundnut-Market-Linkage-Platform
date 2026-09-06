import React, { useState, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Grid, Chip, CircularProgress, Alert, LinearProgress, Slider
} from '@mui/material';
import { Grade, CloudUpload, CheckCircle, TipsAndUpdates } from '@mui/icons-material';
import { qualityGradingAPI } from '../services/api';
import toast from 'react-hot-toast';

const CROPS = ['cotton', 'groundnut'];

const GRADE_COLORS = {
  'Premium (S-6)': '#FFD700',
  'Bold (Premium)': '#FFD700',
  'FAQ (Fair Average Quality)': '#2E7D32',
  'Grade A': '#1565C0',
  'Grade B': '#E65100',
  'Grade C (Low Grade)': '#C62828',
  'Rejected/Below Standard': '#880E4F',
};

export default function QualityGrading() {
  const [form, setForm] = useState({
    crop: 'groundnut',
    moisture_pct: 10,
    foreign_matter_pct: 2,
    photo_description: '',
    quantity_quintal: 100,
    reference_price: 5500,
  });
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoName, setPhotoName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHasPhoto(true);
      setPhotoName(file.name);
      setForm(prev => ({ ...prev, photo_description: `Photo uploaded: ${file.name}` }));
      toast.success('Photo selected — will be included in grading');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        ...form,
        moisture_pct: parseFloat(form.moisture_pct),
        foreign_matter_pct: parseFloat(form.foreign_matter_pct),
        quantity_quintal: form.quantity_quintal ? parseFloat(form.quantity_quintal) : null,
        reference_price: form.reference_price ? parseFloat(form.reference_price) : null,
      };
      const res = await qualityGradingAPI(payload);
      setResult(res.data);
      toast.success(`Grade: ${res.data.grade}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to grade. Is the backend running?';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const gradeColor = result ? GRADE_COLORS[result.grade] || '#666' : '#666';

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main">
          🏅 Quality Grading
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          ગુણવત્તા ગ્રેડ — Estimate your lot's grade and value
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Lot Parameters</Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth label="Crop / પાક"
                value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })}>
                {CROPS.map(c => <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Quantity (Quintals)" type="number"
                value={form.quantity_quintal}
                onChange={e => setForm({ ...form, quantity_quintal: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Reference Price (₹/quintal)" type="number"
                value={form.reference_price}
                onChange={e => setForm({ ...form, reference_price: e.target.value })} />
            </Grid>

            {/* Moisture Slider */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Moisture Content: <strong style={{ color: form.moisture_pct > 10 ? '#C62828' : '#2E7D32' }}>{form.moisture_pct}%</strong>
              </Typography>
              <Slider
                value={parseFloat(form.moisture_pct)}
                onChange={(_, v) => setForm({ ...form, moisture_pct: v })}
                min={4} max={18} step={0.5}
                marks={[
                  { value: 7, label: '7%' },
                  { value: 10, label: '10%' },
                  { value: 13, label: '13%' },
                ]}
                sx={{ color: form.moisture_pct > 10 ? '#C62828' : '#2E7D32' }}
              />
              <Typography variant="caption" color="text.secondary">
                Acceptable range: &lt;10% for premium, &lt;12% for standard
              </Typography>
            </Grid>

            {/* Foreign Matter Slider */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Foreign Matter: <strong style={{ color: form.foreign_matter_pct > 3 ? '#C62828' : '#2E7D32' }}>{form.foreign_matter_pct}%</strong>
              </Typography>
              <Slider
                value={parseFloat(form.foreign_matter_pct)}
                onChange={(_, v) => setForm({ ...form, foreign_matter_pct: v })}
                min={0} max={10} step={0.5}
                marks={[
                  { value: 1, label: '1%' },
                  { value: 3, label: '3%' },
                  { value: 6, label: '6%' },
                ]}
                sx={{ color: form.foreign_matter_pct > 3 ? '#C62828' : '#2E7D32' }}
              />
              <Typography variant="caption" color="text.secondary">
                Acceptable range: &lt;2% for premium, &lt;4% for standard
              </Typography>
            </Grid>

            {/* Photo Upload */}
            <Grid item xs={12}>
              <input
                type="file" accept="image/*" ref={fileRef}
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
              <Box
                onClick={() => fileRef.current.click()}
                sx={{
                  border: `2px dashed ${hasPhoto ? '#2E7D32' : '#90CAF9'}`,
                  borderRadius: 2, p: 3, textAlign: 'center',
                  cursor: 'pointer', background: hasPhoto ? '#E8F5E9' : '#F3F8FF',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#2E7D32', background: '#E8F5E9' },
                }}
              >
                {hasPhoto ? (
                  <>
                    <CheckCircle sx={{ fontSize: 36, color: '#2E7D32' }} />
                    <Typography variant="body2" fontWeight={600} color="success.main" sx={{ mt: 1 }}>
                      ✅ Photo selected: {photoName}
                    </Typography>
                  </>
                ) : (
                  <>
                    <CloudUpload sx={{ fontSize: 36, color: '#90CAF9' }} />
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                      Upload Lot Photo (Optional)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Improves grading confidence. In production, vision AI analyzes the image.
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
          <Button variant="contained" size="large" onClick={handleSubmit}
            disabled={loading} sx={{ mt: 2 }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Grade />}>
            {loading ? 'Grading…' : 'Grade My Lot'}
          </Button>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {result && (
        <Box>
          {/* Grade Result Card */}
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', color: 'white', mb: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="overline" sx={{ color: '#A5D6A7', letterSpacing: 2 }}>
                QUALITY ASSESSMENT RESULT
              </Typography>
              <Box sx={{
                display: 'inline-block', px: 4, py: 1.5, mt: 1, mb: 1,
                background: 'rgba(255,255,255,0.15)',
                border: `3px solid ${gradeColor}`,
                borderRadius: 3,
              }}>
                <Typography variant="h3" fontWeight={900} sx={{ color: gradeColor }}>
                  {result.grade}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#C8E6C9', mb: 2 }}>
                {result.grade_description}
              </Typography>
              <Grid container spacing={2} justifyContent="center" sx={{ mt: 1 }}>
                <Grid item>
                  <Chip label={`Confidence: ${(result.confidence * 100).toFixed(0)}%`}
                    sx={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }} />
                </Grid>
                <Grid item>
                  <Chip label={`Quality Score: ${(result.quality_score * 100).toFixed(0)}/100`}
                    sx={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }} />
                </Grid>
                <Grid item>
                  <Chip label={`Price Impact: ×${result.price_impact_factor}`}
                    sx={{ background: result.price_impact_factor >= 1 ? 'rgba(165,214,167,0.3)' : 'rgba(255,205,210,0.3)', color: '#fff', fontWeight: 700 }} />
                </Grid>
              </Grid>
              {result.price_note && (
                <Typography variant="h6" sx={{ mt: 2, color: '#FFD54F', fontWeight: 700 }}>
                  💰 {result.price_note}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* AI Explanation */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                    🤖 IBM Granite AI Explanation
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.7, color: '#2E7D32' }}>
                    "{result.llm_explanation}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Improvement Tips */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', background: '#FFF8E1' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <TipsAndUpdates color="warning" />
                    <Typography variant="h6" fontWeight={700}>
                      Improvement Tips
                    </Typography>
                  </Box>
                  {result.improvement_suggestions?.length > 0 ? (
                    result.improvement_suggestions.map((tip, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'flex-start' }}>
                        <Typography>💡</Typography>
                        <Typography variant="body2">{tip}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No specific improvements needed.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Alert severity="warning">{result.disclaimer}</Alert>
          <Alert severity="info" sx={{ mt: 1 }}>{result.production_note}</Alert>
        </Box>
      )}
    </Box>
  );
}
