/**
 * @description - Initiating HTTP server and listning to incoming http requests
 */

//Imports and Requires
const http = require("http");
const app = require("./app");

require("dotenv").config();

console.log("Server Js executing... Initiating HTTP server");
const port = process.env.PORT || 5000; // Default port 5000

//Creates HTTP server
const server = http.createServer(app);

//Server then  listen to the port (4000)
server.listen(port, () => {
  console.log(`gateway Server is running on port ${port}`);
});