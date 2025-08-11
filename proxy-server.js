const http = require('http');
const url = require('url');

// Simple CORS-enabled proxy server (no external dependencies)
const server = http.createServer((req, res) => {
  console.log(`📥 ${req.method} ${req.url} from ${req.headers.origin || req.headers.host}`);
  
  // CORS headers for all requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:8081',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    'Access-Control-Allow-Credentials': 'true'
  };
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }
  
  // Parse the URL to get the path
  const parsedUrl = url.parse(req.url);
  
  // Backend request options
  const backendOptions = {
    hostname: 'localhost',
    port: 8001,
    path: parsedUrl.path,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:8001'
    }
  };
  
  // Remove proxy-specific headers
  delete backendOptions.headers.origin;
  delete backendOptions.headers.referer;
  
  console.log(`🔄 Proxying to backend: ${req.method} http://localhost:8001${parsedUrl.path}`);
  
  // Create request to backend
  const backendReq = http.request(backendOptions, (backendRes) => {
    console.log(`✅ Backend responded: ${backendRes.statusCode}`);
    
    // Set CORS and backend headers
    const responseHeaders = { ...corsHeaders, ...backendRes.headers };
    res.writeHead(backendRes.statusCode, responseHeaders);
    
    // Pipe backend response to client
    backendRes.pipe(res);
  });
  
  backendReq.on('error', (error) => {
    console.error('❌ Backend connection error:', error.message);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: 'Backend connection failed', details: error.message }));
  });
  
  // Pipe client request to backend
  req.pipe(backendReq);
});

const PORT = 8002;
server.listen(PORT, () => {
  console.log(`🔗 Proxy server running on http://localhost:${PORT}`);
  console.log(`📱 Proxying requests from web app to backend`);
  console.log(`🌐 Web App: http://localhost:8081 -> Proxy: http://localhost:${PORT} -> Backend: http://localhost:8001`);
  console.log(`\n🚀 Ready to test full backend connectivity!`);
});
