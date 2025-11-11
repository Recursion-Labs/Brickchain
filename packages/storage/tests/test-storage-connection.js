// Quick test to verify storage server connection
const axios = require('axios');

const STORAGE_URL = 'http://localhost:3020';

async function testConnection() {
  try {
    console.log('Testing storage server connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get(`${STORAGE_URL}/health`, {
      timeout: 5000
    });
    
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test API docs endpoint
    const docsResponse = await axios.get(`${STORAGE_URL}/`, {
      timeout: 5000
    });
    
    console.log('✅ API docs accessible:', docsResponse.data.service);
    
    // Test list documents endpoint
    const listResponse = await axios.get(`${STORAGE_URL}/api/docs`, {
      timeout: 5000
    });
    
    console.log('✅ Documents list accessible:', {
      success: listResponse.data.success,
      count: listResponse.data.count
    });
    
    console.log('\n🎉 All tests passed! Storage server is working correctly.');
    
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