const axios = require('axios');
require('dotenv').config();

// Configuration
const API_BASE_URL = `http://localhost:${process.env.PORT || 8000}`;
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Password123!';
const TEST_USERNAME = 'testuser';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to log test results
const logResult = (testName, success, message = '', data = null) => {
  const status = success ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`${colors.bright}${testName}${colors.reset}: ${status}`);
  
  if (message) {
    console.log(`  ${message}`);
  }
  
  if (data && !success) {
    console.log(`  ${colors.yellow}Response:${colors.reset}`, data);
  }
  
  console.log(''); // Empty line for readability
};

// API client with error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  validateStatus: () => true // Don't throw on error status codes
});

// Test health endpoint
const testHealth = async () => {
  try {
    console.log(`${colors.cyan}Testing API Health...${colors.reset}`);
    const response = await api.get('/health');
    
    logResult(
      'Health Check', 
      response.status === 200 && response.data.status === 'healthy',
      `Status: ${response.status}`,
      response.data
    );
    
    return response.status === 200;
  } catch (error) {
    logResult('Health Check', false, `Error: ${error.message}`);
    return false;
  }
};

// Test authentication endpoints
const testAuth = async () => {
  try {
    console.log(`${colors.cyan}Testing Authentication Endpoints...${colors.reset}`);
    
    // Register
    const registerResponse = await api.post('/api/auth/register', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      username: TEST_USERNAME
    });
    
    const registerSuccess = registerResponse.status === 201 || 
                           (registerResponse.status === 409 && registerResponse.data.error === 'Email already in use');
    
    logResult(
      'User Registration', 
      registerSuccess,
      registerResponse.status === 201 ? 'User registered successfully' : 'User already exists',
      registerResponse.data
    );
    
    // Login
    const loginResponse = await api.post('/api/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const loginSuccess = loginResponse.status === 200 && loginResponse.data.accessToken;
    
    logResult(
      'User Login', 
      loginSuccess,
      loginSuccess ? 'Login successful' : 'Login failed',
      loginResponse.data
    );
    
    // Store token for subsequent requests
    const token = loginSuccess ? loginResponse.data.accessToken : null;
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Test token validation
      const meResponse = await api.get('/api/users/me');
      
      logResult(
        'Token Validation', 
        meResponse.status === 200,
        meResponse.status === 200 ? 'Token is valid' : 'Token validation failed',
        meResponse.data
      );
    }
    
    return loginSuccess;
  } catch (error) {
    logResult('Authentication Tests', false, `Error: ${error.message}`);
    return false;
  }
};

// Test product endpoints
const testProducts = async () => {
  try {
    console.log(`${colors.cyan}Testing Product Endpoints...${colors.reset}`);
    
    // Get products
    const productsResponse = await api.get('/api/products');
    
    logResult(
      'Get Products', 
      productsResponse.status === 200,
      `Retrieved ${productsResponse.data?.products?.length || 0} products`,
      productsResponse.data
    );
    
    // Create product (requires authentication)
    if (api.defaults.headers.common['Authorization']) {
      const createResponse = await api.post('/api/products', {
        title: 'Test Product',
        description: 'This is a test product created by the API test script',
        price: 9.99
      });
      
      const createSuccess = createResponse.status === 201;
      
      logResult(
        'Create Product', 
        createSuccess,
        createSuccess ? 'Product created successfully' : 'Failed to create product',
        createResponse.data
      );
      
      // If product was created, test getting it by ID
      if (createSuccess && createResponse.data.id) {
        const productId = createResponse.data.id;
        
        const getProductResponse = await api.get(`/api/products/${productId}`);
        
        logResult(
          'Get Product by ID', 
          getProductResponse.status === 200,
          getProductResponse.status === 200 ? 'Product retrieved successfully' : 'Failed to retrieve product',
          getProductResponse.data
        );
      }
    } else {
      logResult('Create Product', false, 'Skipped - Not authenticated');
    }
    
    return productsResponse.status === 200;
  } catch (error) {
    logResult('Product Tests', false, `Error: ${error.message}`);
    return false;
  }
};

// Test AI endpoints
const testAI = async () => {
  try {
    console.log(`${colors.cyan}Testing AI Endpoints...${colors.reset}`);
    
    // Skip if not authenticated
    if (!api.defaults.headers.common['Authorization']) {
      logResult('AI Tests', false, 'Skipped - Not authenticated');
      return false;
    }
    
    // Test content generation
    const generateResponse = await api.post('/api/ai/generate', {
      prompt: 'Write a short guide about effective time management',
      category: 'productivity',
      format: 'guide'
    });
    
    const generateSuccess = generateResponse.status === 202 || generateResponse.status === 200;
    
    logResult(
      'Generate Content', 
      generateSuccess,
      generateSuccess ? 'Content generation request accepted' : 'Content generation failed',
      generateResponse.data
    );
    
    return generateSuccess;
  } catch (error) {
    logResult('AI Tests', false, `Error: ${error.message}`);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log(`${colors.bright}${colors.blue}===== MetaMind API Test Suite =====${colors.reset}\n`);
  
  const healthOk = await testHealth();
  
  if (!healthOk) {
    console.log(`${colors.red}API server is not responding. Make sure it's running on ${API_BASE_URL}${colors.reset}`);
    return;
  }
  
  await testAuth();
  await testProducts();
  await testAI();
  
  console.log(`${colors.bright}${colors.blue}===== Test Suite Complete =====${colors.reset}\n`);
};

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Test suite error:${colors.reset}`, error);
});