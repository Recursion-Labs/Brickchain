// Minimal test for storage server (works without IPFS/blockchain)
const axios = require('axios');

const STORAGE_URL = 'http://localhost:3020';

async function testConnection() {
  console.log('🧪 Testing storage server connection (minimal mode)...\n');
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${STORAGE_URL}/health`, {
      timeout: 5000
    });
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test API docs endpoint
    console.log('\n2️⃣ Testing API docs endpoint...');
    const docsResponse = await axios.get(`${STORAGE_URL}/`, {
      timeout: 5000
    });
    console.log('✅ API docs accessible:', docsResponse.data.service);
    
    // Test list documents endpoint
    console.log('\n3️⃣ Testing list documents endpoint...');
    const listResponse = await axios.get(`${STORAGE_URL}/api/docs`, {
      timeout: 5000
    });
    console.log('✅ Documents list accessible:', {
      success: listResponse.data.success,
      count: listResponse.data.count
    });
    
    console.log('\n🎉 Core storage server functionality is working correctly!');
    console.log('\n📋 Note: File upload requires additional services:');
    console.log('   - IPFS node (http://127.0.0.1:5001)');
    console.log('   - Substrate node (ws://localhost:9944)');
    console.log('   You can start the server without these services for basic testing.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the storage server is running:');
      console.log('   cd packages/storage');
      console.log('   cargo run --bin store-server ./.pdfdb 3020');
    }
  }
}

testConnection();