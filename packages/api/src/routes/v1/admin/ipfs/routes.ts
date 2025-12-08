import { Router } from 'express';
import { v1 } from '@/controllers';
import { authenticate, requireAdmin } from '@/middlewares/auth.middleware';

const router = Router();

// Require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Pin a single document to IPFS
router.post('/:id/pin', v1.admin.ipfsControllers.pinController.pinDocumentToIPFS);

// Batch pin multiple documents to IPFS
router.post('/pin-batch', v1.admin.ipfsControllers.pinController.pinMultipleDocumentsToIPFS);

export default router;
