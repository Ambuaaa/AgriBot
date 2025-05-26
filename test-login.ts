import axios from 'axios';

async function testLogin() {
  try {
    console.log('Attempting to connect to server...');
    const response = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@agribot.com',
      password: 'admin123'
    }, {
      timeout: 5000 // 5 second timeout
    });

    console.log('Login successful!');
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('Login failed!');
    if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to server. Is it running on port 4000?');
    } else if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('No response received');
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin(); 