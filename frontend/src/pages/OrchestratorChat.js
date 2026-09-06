import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, IconButton,
  Chip, CircularProgress, Avatar, Paper, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Send, SmartToy, Person, Agriculture } from '@mui/icons-material';
import { orchestratorAPI } from '../services/api';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  "What is the groundnut price at Rajkot today?",
  "Should I sell my cotton now or wait?",
  "Find me cotton buyers near Surendranagar",
  "What grade is my groundnut with 9% moisture?",
  "Show me my income summary for this season",
  "Is it a good time to store cotton for 2 weeks?",
];

export default function OrchestratorChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Jai Kisan! 🌾 I am KhedutMitra AI, powered by IBM Granite LLM.\n\nI can help you with:\n• Mandi price forecasts\n• Finding direct buyers\n• Storage & selling timing\n• Quality grading\n• Income dashboard\n\nAsk me anything in English, Hindi, or Gujarati!",
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text: userMsg, time: new Date() }]);
    setLoading(true);

    try {
      const res = await orchestratorAPI({ query: userMsg, language });
      const data = res.data;

      let responseText = data.response;
      if (data.suggested_agents && data.suggested_agents.length > 0 && !data.suggested_agents.includes('general')) {
        const agentLabels = {
          price_forecast: '📈 Price Forecast',
          buyer_matching: '🤝 Buyer Matching',
          storage_advisor: '🏪 Storage Advisor',
          quality_grading: '🏅 Quality Grading',
          income_dashboard: '📊 Income Dashboard',
        };
        const agentHints = data.suggested_agents.map(a => agentLabels[a] || a).join(', ');
        responseText += `\n\n👆 Use the sidebar to access: ${agentHints}`;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: responseText,
        intents: data.intents_detected,
        time: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, I could not connect to the AI backend. Please check if the backend server is running on port 8000.',
        time: new Date(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (t) =>
    t ? `${t.getHours()}:${String(t.getMinutes()).padStart(2, '0')}` : '';

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main">
          🤖 KhedutMitra AI Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          AI સહાયક — Powered by IBM Granite LLM + watsonx.ai
        </Typography>
      </Box>

      {/* Language + Quick Prompts */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Language</InputLabel>
          <Select value={language} label="Language" onChange={e => setLanguage(e.target.value)}>
            <MenuItem value="english">English</MenuItem>
            <MenuItem value="hindi">Hindi</MenuItem>
            <MenuItem value="gujarati">Gujarati</MenuItem>
          </Select>
        </FormControl>
        {QUICK_PROMPTS.slice(0, 3).map((p, i) => (
          <Chip key={i} label={p} clickable onClick={() => sendMessage(p)}
            size="small" variant="outlined" color="primary" />
        ))}
      </Box>

      {/* Chat Window */}
      <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{
          flexGrow: 1, overflowY: 'auto', p: 2,
          background: '#F8FBF8',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {messages.map((msg, i) => (
            <Box key={i} sx={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: 1.5, alignItems: 'flex-start',
            }}>
              <Avatar sx={{
                width: 36, height: 36, flexShrink: 0,
                background: msg.role === 'user' ? '#1565C0' : '#1B5E20',
              }}>
                {msg.role === 'user' ? <Person /> : <Agriculture />}
              </Avatar>
              <Box sx={{ maxWidth: '75%' }}>
                <Paper sx={{
                  p: 2,
                  background: msg.role === 'user' ? '#E3F2FD'
                    : msg.isError ? '#FFEBEE' : '#E8F5E9',
                  borderRadius: msg.role === 'user'
                    ? '16px 4px 16px 16px'
                    : '4px 16px 16px 16px',
                  border: msg.isError ? '1px solid #FFCDD2' : 'none',
                }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {msg.text}
                  </Typography>
                  {msg.intents && msg.intents.length > 0 && !msg.intents.includes('general') && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {msg.intents.map(intent => (
                        <Chip key={intent} label={intent.replace('_', ' ')} size="small"
                          color="success" variant="outlined" sx={{ fontSize: 10 }} />
                      ))}
                    </Box>
                  )}
                </Paper>
                <Typography variant="caption" color="text.secondary"
                  sx={{ mt: 0.3, display: 'block', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {formatTime(msg.time)}
                </Typography>
              </Box>
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Avatar sx={{ width: 36, height: 36, background: '#1B5E20' }}>
                <Agriculture />
              </Avatar>
              <Paper sx={{ p: 2, background: '#E8F5E9', borderRadius: '4px 16px 16px 16px' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <CircularProgress size={16} color="success" />
                  <Typography variant="body2" color="text.secondary">
                    IBM Granite is thinking…
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
          <div ref={bottomRef} />
        </Box>

        {/* Input Area */}
        <Box sx={{
          p: 2, borderTop: '1px solid #E8F5E9',
          display: 'flex', gap: 1, background: 'white',
        }}>
          <TextField
            fullWidth multiline maxRows={3}
            placeholder="Ask about prices, buyers, storage, quality… (English/Hindi/Gujarati)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            variant="outlined" size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <IconButton
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            sx={{ background: '#1B5E20', color: 'white', '&:hover': { background: '#2E7D32' }, '&:disabled': { background: '#C8E6C9' } }}
          >
            <Send />
          </IconButton>
        </Box>
      </Card>

      {/* More Quick Prompts */}
      <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {QUICK_PROMPTS.slice(3).map((p, i) => (
          <Chip key={i} label={p} clickable onClick={() => sendMessage(p)}
            size="small" variant="outlined" color="success" />
        ))}
      </Box>
    </Box>
  );
}
