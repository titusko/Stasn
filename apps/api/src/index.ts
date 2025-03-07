
import express from 'express';
import cors from 'cors';
import { config } from './config';
import ipfsRoutes from './routes/ipfs';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
}));

// Routes
app.use('/api/ipfs', ipfsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  res.status(500).json({ message: err.message || 'Something went wrong' });
});

// Start server
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://0.0.0.0:${PORT}`);
});
