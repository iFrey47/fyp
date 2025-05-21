import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { Server } from "socket.io";

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

app.use(express.urlencoded({ extended: true })); // For form data

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

  // Video call signaling
  socket.on("call_user", (data) => {
    const { to, offer, from } = data;
    if (activeUsers[to]) {
      io.to(activeUsers[to]).emit("call_incoming", { from, offer });
    }
  });

  socket.on("call_accepted", (data) => {
    const { to, answer } = data;
    if (activeUsers[to]) {
      io.to(activeUsers[to]).emit("call_accepted", { answer });
    }
  });

  socket.on("call_ice_candidate", (data) => {
    const { to, candidate } = data;
    if (activeUsers[to]) {
      io.to(activeUsers[to]).emit("call_ice_candidate", { candidate });
    }
  });

  socket.on("call_end", (data) => {
    const { to } = data;
    if (activeUsers[to]) {
      io.to(activeUsers[to]).emit("call_ended");
    }
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
