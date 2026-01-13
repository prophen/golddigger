import http from "node:http";

const PORT = 8001;

const __dirname = import.meta.__dirname;

const server = http.createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end("<html><h1>The server is working</h1></html>");
});

server.listen(PORT, () => console.log(`Connected on http://localhost:${PORT}`));
