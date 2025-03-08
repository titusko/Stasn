
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate nonce for user
router.post('/nonce', async (req, res) => {
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }
  
  try {
    // Generate a random nonce
    const nonce = Math.floor(Math.random() * 1000000).toString();
    
    // Find or create user
    const user = await prisma.user.upsert({
      where: { address },
      update: { nonce },
      create: {
        address,
        nonce,
        username: `user_${address.substring(2, 8)}`,
      },
    });
    
    res.json({ nonce: user.nonce });
  } catch (error) {
    console.error('Error generating nonce:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

// Verify signature and authenticate user
router.post('/verify', async (req, res) => {
  const { address, signature } = req.body;
  
  if (!address || !signature) {
    return res.status(400).json({ error: 'Address and signature are required' });
  }
  
  try {
    // Get the user and their nonce
    const user = await prisma.user.findUnique({
      where: { address },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Message that was signed
    const message = `Sign this message to authenticate with our platform. Nonce: ${user.nonce}`;
    
    // Recover the address from the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    // Check if the recovered address matches the claimed address
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Generate a new nonce for next time
    const newNonce = Math.floor(Math.random() * 1000000).toString();
    
    // Update the user with the new nonce
    await prisma.user.update({
      where: { address },
      data: { nonce: newNonce },
    });
    
    // Create JWT token
    const token = jwt.sign(
      { address: user.address, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, user });
  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(500).json({ error: 'Failed to verify signature' });
  }
});

export default router;
