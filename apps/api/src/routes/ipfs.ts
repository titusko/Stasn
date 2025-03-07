
import { Router } from 'express';
import multer from 'multer';
import { ipfsService } from '@/services/ipfsService';
import { authenticateUser } from '@/middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload file to IPFS
router.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const name = req.body.name || req.file.originalname;
    let metadata = {};
    
    try {
      metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    } catch (e) {
      // Ignore JSON parse errors
    }

    const result = await ipfsService.uploadFile(req.file.buffer, {
      name,
      pinataMetadata: {
        name,
        keyvalues: {
          userId: req.user?.id,
          ...metadata,
        },
      },
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('IPFS upload error:', error);
    return res.status(500).json({ message: error.message || 'Upload failed' });
  }
});

// Get content from IPFS
router.get('/content/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const content = await ipfsService.getContent(hash);
    
    return res.status(200).json(content);
  } catch (error: any) {
    console.error('IPFS content retrieval error:', error);
    return res.status(500).json({ message: error.message || 'Failed to retrieve content' });
  }
});

// Delete content from IPFS (admin only)
router.delete('/unpin/:hash', authenticateUser, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { hash } = req.params;
    await ipfsService.unpinContent(hash);
    
    return res.status(200).json({ message: 'Content unpinned successfully' });
  } catch (error: any) {
    console.error('IPFS unpin error:', error);
    return res.status(500).json({ message: error.message || 'Failed to unpin content' });
  }
});

export default router;
