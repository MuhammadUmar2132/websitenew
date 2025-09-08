const express = require('express');
const mongoose = require('mongoose');
const { PORT } = require('./config/index');
const dbConnect = require("./database/index");
const router = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ✅ Use CORS before all middleware
app.use(
  cors({
    origin: 'http://localhost:3000', // Your frontend
    credentials: true, // ✅ Must allow credentials for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
);

// ✅ JSON + Cookies
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// ✅ All routes
app.use(router);

// ✅ Static file serving if needed
app.use("/storage", express.static("storage"));

// ✅ Global error handler
app.use(errorHandler);

// ✅ Connect DB and start server
dbConnect();
app.listen(PORT, () => {
  console.log(`✅ Backend is running on port: ${PORT}`);
});
