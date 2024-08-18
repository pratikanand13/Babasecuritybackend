const express = require('express');

const app = express();
require("./src/db/mongoose");


app.use(express.json());

const testapiRouter = require("./src/routes/api")
const userApi = require("./src/routes/users")
app.use(testapiRouter);
app.use(userApi)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
