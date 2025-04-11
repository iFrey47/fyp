// import express, { json } from "express";
// import cors from "cors";
// import { config } from "dotenv";
// // import connectDB from "./config/db";

// import connectDB from "./config/db.js";

// import authRoutes from "./routes/authRoutes.js";

// const app = express();

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     methods: "GET,HEAD,POST,PUT,PATCH,DELETE",
//     allowedHeaders: "Content-Type,Authorization",
//     credentials: true,
//   })
// );

// config();
// connectDB();

// app.use(express.json());

// app.use("/api/auth", authRoutes);

// // Middleware
// // app.use(cors({ origin: "http://localhost:5173" }));

// app.options("*", cors());

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { Server } from "socket.io"; // <-- Corrected import

const app = express();

// Set up CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

// Initialize environment variables
config();

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Initialize HTTP server
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

// Initialize Socket.IO with the existing HTTP server
// Initialize Socket.IO with CORS config
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Match your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store active users (mapping usernames to socket IDs)
const activeUsers = {}; // { username: socketId }

io.on("connection", (socket) => {
  // Simple username registration
  socket.on("register", (username) => {
    activeUsers[username] = socket.id;
  });

  // Message routing
  socket.on("send_message", ({ from, to, message }) => {
    if (activeUsers[to]) {
      io.to(activeUsers[to]).emit("receive_message", { from, message });
    }
    //  else {
    //   console.log(`${to} is currently offline`);
    //   // Optional: Store offline messages in DB here
    // }
  });

  socket.on("disconnect", () => {
    Object.entries(activeUsers).forEach(([username, id]) => {
      if (id === socket.id) {
        delete activeUsers[username];
        console.log(`User disconnected: ${username}`);
      }
    });
  });
});
