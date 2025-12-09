# BrickChain Marketplace APIs

This module contains all marketplace-related APIs for property listings, bidding, and blockchain interactions.

## Overview

The marketplace APIs are organized into four main categories:

1. **Properties** - Property registration and management
2. **Listings** - Property listing creation and management
3. **Bids** - Bidding system for listed properties
4. **Blockchain** - Blockchain transaction tracking

## Base URL

All marketplace endpoints are prefixed with:
```
/v1/marketplace
```

## Endpoints

### Properties (`/v1/marketplace/properties`)

- `POST /` - Register a new property
- `GET /` - List all properties with filters
- `GET /:id` - Get property by database ID
- `GET /chain/:propertyId` - Get property by on-chain property ID
- `PATCH /:propertyId/status` - Update property status
- `DELETE /:propertyId` - Delete property

### Listings (`/v1/marketplace/listings`)

- `POST /` - Create a new listing
- `GET /` - List all listings with filters
- `GET /:id` - Get listing by database ID
- `GET /chain/:listingId` - Get listing by on-chain listing ID
- `PATCH /:listingId` - Update listing price
- `POST /:listingId/cancel` - Cancel listing

### Bids (`/v1/marketplace/bids`)

- `POST /` - Create a new bid
- `GET /` - List all bids (Admin only)
- `GET /my` - Get current user's bids
- `GET /:id` - Get bid by ID
- `GET /listing/:listingId` - Get all bids for a listing
- `POST /:id/accept` - Accept a bid (Seller only)
- `POST /:id/reject` - Reject a bid (Seller only)
- `POST /:id/withdraw` - Withdraw a bid (Bidder only)

### Blockchain (`/v1/marketplace/blockchain`)

- `GET /status` - Get blockchain connection status
- `GET /tx/:txHash` - Get transaction details
- `GET /tx/:txHash/wait` - Wait for transaction confirmation

## Response Format

All endpoints return responses in this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "page": 1,
  "limit": 20,
  "total": 100,
  "totalPages": 5
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Example Usage

### Register Property
```bash
curl -X POST http://localhost:3000/v1/marketplace/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "propertyId": "0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
    "owner": "0x1234567890123456789012345678901234567890",
    "valuation": "1000000",
    "locationHash": "QmTestLocationHash",
    "documentHash": "QmTestDocumentHash"
  }'
```

### Create Listing
```bash
curl -X POST http://localhost:3000/v1/marketplace/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "propertyId": "0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
    "price": "1000000",
    "durationSeconds": 2592000
  }'
```

### Place Bid
```bash
curl -X POST http://localhost:3000/v1/marketplace/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "listingId": "uuid-here",
    "amount": "950000",
    "message": "Interested in this property"
  }'
```

### Get Active Listings
```bash
curl http://localhost:3000/v1/marketplace/listings?status=Active
```

## TODO

The following items need to be implemented:

### Database Integration
- [ ] Connect to Prisma/database
- [ ] Create database schemas for properties, listings, and bids
- [ ] Implement CRUD operations

### Blockchain Integration
- [ ] Integrate with Midnight blockchain service
- [ ] Implement property registration on-chain
- [ ] Implement listing creation on-chain
- [ ] Add transaction tracking

### Authentication & Authorization
- [ ] Add authentication middleware
- [ ] Implement role-based access control
- [ ] Add wallet address verification

### Business Logic
- [ ] Implement listing expiration logic
- [ ] Implement bid expiration logic
- [ ] Add validation for bid amounts
- [ ] Add seller verification for listings

### Services
- [ ] Create PropertyService
- [ ] Create ListingService
- [ ] Create BidService
- [ ] Create BlockchainService

## File Structure

```
marketplace/
├── index.ts                    # Main router
├── property.routes.ts          # Property routes
├── listing.routes.ts           # Listing routes
├── bid.routes.ts              # Bid routes
├── blockchain.routes.ts       # Blockchain routes
└── README.md                  # This file

controllers/v1/marketplace/
├── index.ts                   # Controller exports
├── property.controller.ts     # Property controllers
├── listing.controller.ts      # Listing controllers
├── bid.controller.ts         # Bid controllers
└── blockchain.controller.ts  # Blockchain controllers
```

## Migration from Original Marketplace

This implementation is based on the original marketplace package (`packages/marketplace`) and follows the existing API folder structure. Key differences:

1. Uses the existing API folder's routing pattern (`/v1/marketplace`)
2. Follows the existing controller structure
3. Uses the existing async handler pattern
4. Integrates with existing authentication middleware
5. Uses Zod for validation (already in dependencies)

## Next Steps

1. Create database schemas in Prisma
2. Implement services layer
3. Add authentication middleware integration
4. Integrate blockchain service
5. Add comprehensive error handling
6. Write tests
7. Add API documentation with Swagger/OpenAPI
