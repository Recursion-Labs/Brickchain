#!/bin/bash
# Copy deployed contract addresses to frontend .env

DEPLOYMENTS_FILE="deployments/addresses.json"
FRONTEND_ENV="../../frontend/.env.local"

if [ ! -f "$DEPLOYMENTS_FILE" ]; then
    echo "❌ Deployment addresses not found. Deploy contracts first."
    exit 1
fi

echo "📋 Copying contract addresses to frontend..."

# Read addresses from JSON
PROPERTY_REGISTRY=$(jq -r '.propertyRegistry' $DEPLOYMENTS_FILE)
MARKETPLACE=$(jq -r '.marketplace' $DEPLOYMENTS_FILE)
ESCROW=$(jq -r '.escrow' $DEPLOYMENTS_FILE)
VERIFICATION=$(jq -r '.verification' $DEPLOYMENTS_FILE)
FRACTIONAL_TOKEN=$(jq -r '.fractionalToken' $DEPLOYMENTS_FILE)
MAIN=$(jq -r '.main' $DEPLOYMENTS_FILE)
ROLE=$(jq -r '.role' $DEPLOYMENTS_FILE)
ACCESS_CONTROL=$(jq -r '.accessControl' $DEPLOYMENTS_FILE)
AUDIT_LOG=$(jq -r '.auditLog' $DEPLOYMENTS_FILE)

# Create or update .env.local
cat > $FRONTEND_ENV << EOF
# Midnight Network Configuration
NEXT_PUBLIC_MIDNIGHT_RPC_URL=https://rpc.testnet-02.midnight.network
NEXT_PUBLIC_MIDNIGHT_INDEXER_URL=https://indexer.testnet-02.midnight.network/api/v1/graphql

# Contract Addresses (auto-generated from deployment)
NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS=$PROPERTY_REGISTRY
NEXT_PUBLIC_MARKETPLACE_ADDRESS=$MARKETPLACE
NEXT_PUBLIC_ESCROW_ADDRESS=$ESCROW
NEXT_PUBLIC_VERIFICATION_ADDRESS=$VERIFICATION
NEXT_PUBLIC_FRACTIONAL_TOKEN_ADDRESS=$FRACTIONAL_TOKEN
NEXT_PUBLIC_MAIN_ADDRESS=$MAIN
NEXT_PUBLIC_ROLE_ADDRESS=$ROLE
NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS=$ACCESS_CONTROL
NEXT_PUBLIC_AUDIT_LOG_ADDRESS=$AUDIT_LOG
EOF

echo "✅ Contract addresses copied to $FRONTEND_ENV"
echo ""
echo "📋 Deployed Addresses:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat $DEPLOYMENTS_FILE | jq .
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
