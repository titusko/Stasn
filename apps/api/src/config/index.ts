
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '../../.env' });

export const config = {
  port: process.env.API_PORT || 4000,
  pinataJwt: process.env.PINATA_JWT || '',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
};
