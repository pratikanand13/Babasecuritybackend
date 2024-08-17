const mongoose = require('mongoose');

// Connect to MongoDB using the connection string from the environment variable
mongoose.connect("mongodb+srv://pratikzx:2cHI4yJvyPwyWsKn@babadb.4w2vy.mongodb.net/?retryWrites=true&w=majority&appName=BabaDB")
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));
