const express = require('express');
const mongoose = require('mongoose');
const { PORT } = require('./config/index');
const dbConnect = require("./database/index");
const router = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "https://umar-portfolio-frontend.vercel.app",
  "https://websitenew-g6yv.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

// ✅ Use CORS before all middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
