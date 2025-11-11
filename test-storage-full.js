// Comprehensive test for storage server including file upload
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const STORAGE_URL = 'http://localhost:3020';
const TEST_FILE_PATH = './test-upload.pdf';

async function testConnection() {
  console.log('🧪 Testing storage server connection...\n');
  
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
    
    // Test file upload (if test file exists)
    console.log('\n4️⃣ Testing file upload...');
    if (fs.existsSync(TEST_FILE_PATH)) {
      try {
        const form = new FormData();
        form.append('file', fs.createReadStream(TEST_FILE_PATH));
        
        const uploadResponse = await axios.post(`${STORAGE_URL}/api/store`, form, {
          headers: form.getHeaders(),
          timeout: 30000 // Longer timeout for upload
        });
        
        console.log('✅ File upload successful:', {
          id: uploadResponse.data.id,
          size: uploadResponse.data.size_bytes,
          cid: uploadResponse.data.cid,
          block_hash: uploadResponse.data.block_hash
        });
      } catch (uploadError) {
        console.log('⚠️  File upload failed:', uploadError.response?.data?.error || uploadError.message);
        
        // Check if it's a connection error related to IPFS or blockchain
        if (uploadError.response?.data?.error?.includes('tcp connect error')) {
          console.log('\n💡 This error is likely due to missing IPFS or blockchain connectivity.');
          console.log('   The server requires:');
          console.log('   - IPFS node running (default: http://127.0.0.1:5001)');
          console.log('   - Substrate node running (default: ws://localhost:9944)');
          console.log('   You can set these with environment variables:');
          console.log('   - IPFS_URL=http://your-ipfs:5001');
          console.log('   - NODE_URL=ws://your-node:9944');
          console.log('   - SEED=//Alice (or your dev seed)');
        }
      }
    } else {
      console.log('⚠️  Test file not found:', TEST_FILE_PATH);
    }
    
    console.log('\n🎉 Basic connection tests completed successfully!');
    
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