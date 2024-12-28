import { POST } from './route';

async function testArbitrageEndpoint() {
  try {
    const response = await POST(new Request('http://localhost:3000/api/find-arbitrage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }));
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testArbitrageEndpoint();
