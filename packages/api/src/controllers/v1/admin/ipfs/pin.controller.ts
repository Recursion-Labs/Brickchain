/**
 * IPFS Pinning Controller
 * Handles endpoints for pinning documents to IPFS
 */

import { Request, Response } from 'express';
import catchAsync from '@/handlers/async.handler';
import { APIError } from '@/utils/APIerror';
import { ipfsPinningService } from '@/services/ipfs-pinning.service';
import { db } from '@/config/database';

/**
 * Pin a document to IPFS
 * POST /v1/admin/documents/:id/pin
 * 
 * Request body: { fileId?: string }
 * Response: { success: boolean, cid: string, ipfsUrl: string }
 */
const pinDocumentToIPFS = catchAsync(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[PIN] Received pin request for ID: ${id}`);

    if (!id) {
      throw new APIError(400, 'Document ID is required');
    }

    console.log(`[PIN] Starting IPFS pinning process...`);
    // Pin the document to IPFS
    const cid = await ipfsPinningService.pinFileToIPFS(id);
    console.log(`[PIN] Got CID: ${cid}`);
    
    const ipfsUrl = ipfsPinningService.getIPFSUrl(cid);
    console.log(`[PIN] IPFS URL: ${ipfsUrl}`);

    // Update document record with CID
    console.log(`[PIN] Upserting document in database...`);
    await db.document.upsert({
      where: { fileId: id },
      update: {
        cid,
        ipfsUrl,
        pinned: true,
        pinnedAt: new Date(),
      },
      create: {
        fileId: id,
        fileName: `document-${id}`,
        cid,
        ipfsUrl,
        fileSize: 0, // Will be updated separately if needed
        mimeType: 'application/octet-stream',
        uploadedBy: (req as any).user?.id || 'system',
        pinned: true,
        pinnedAt: new Date(),
      },
    });
    console.log(`[PIN] Document upserted successfully`);

    res.status(200).json({
      success: true,
      id,
      cid,
      ipfsUrl,
      message: 'Document pinned to IPFS successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PIN] Pin to IPFS failed:', errorMessage);
    console.error('[PIN] Error stack:', error instanceof Error ? error.stack : 'no stack');
    throw new APIError(500, `Failed to pin document: ${errorMessage}`);
  }
});

/**
 * Batch pin multiple documents to IPFS
 * POST /v1/admin/documents/pin-batch
 * 
 * Request body: { ids: string[] }
 * Response: { success: boolean, results: Array<{ id, cid, ipfsUrl }> }
 */
const pinMultipleDocumentsToIPFS = catchAsync(async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new APIError(400, 'Array of document IDs is required');
    }

    const results = await Promise.allSettled(
      ids.map(async (id) => {
        const cid = await ipfsPinningService.pinFileToIPFS(id);
        const ipfsUrl = ipfsPinningService.getIPFSUrl(cid);

        // Update document record with CID
        await db.document.upsert({
          where: { fileId: id },
          update: {
            cid,
            ipfsUrl,
            pinned: true,
            pinnedAt: new Date(),
          },
          create: {
            fileId: id,
            fileName: `document-${id}`,
            cid,
            ipfsUrl,
            fileSize: 0,
            mimeType: 'application/octet-stream',
            uploadedBy: (req as any).user?.id || 'system',
            pinned: true,
            pinnedAt: new Date(),
          },
        });

        return { id, cid, ipfsUrl };
      })
    );

    const successful = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    const failed = results
      .filter((r) => r.status === 'rejected')
      .map((r) => (r as PromiseRejectedResult).reason);

    res.status(200).json({
      success: failed.length === 0,
      results: successful,
      errors: failed.length > 0 ? failed : undefined,
      message: `Pinned ${successful.length} of ${ids.length} documents`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Batch pin failed:', errorMessage);
    throw new APIError(500, `Failed to pin documents: ${errorMessage}`);
  }
});

export default {
  pinDocumentToIPFS,
  pinMultipleDocumentsToIPFS,
};
