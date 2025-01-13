// This will be replaced by environment variables in production
export const API_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL.startsWith('http') 
    ? process.env.REACT_APP_API_URL 
    : `https://${process.env.REACT_APP_API_URL}`
  : 'http://localhost:5002';
export const API_ENDPOINT = `${API_URL}/api`;

// Add this line to your .gitignore to avoid committing the production URL
// .env.production
