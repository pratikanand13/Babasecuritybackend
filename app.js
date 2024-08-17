const express = require('express')
const app = express()
require("./src/db/mongoose");
const logRequest = require('./src/middleware/logRequest');
app.use(express.json())
app.use(logRequest)
const testapiRouter = require("./src/routes/api")
app.use(testapiRouter)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});