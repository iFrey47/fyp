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
const io = new Server(server); // <-- Updated here

// Store active users (mapping usernames to socket IDs)
let users = {};

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When a user registers (e.g., student or mentor logs in)
  socket.on("register", (username) => {
    users[username] = socket.id;
    console.log(`User registered: ${username}, socket ID: ${socket.id}`);
  });

  // Handle message sending from student to mentor
  socket.on("send_message", (data) => {
    const { to, message, from } = data;
    console.log(`Message from ${from} to ${to}: ${message}`);

    // Check if the recipient (mentor) is online
    if (users[to]) {
      // Send the message to the mentor's socket
      io.to(users[to]).emit("receive_message", { from, message });
      console.log(`Message sent to ${to}`);
    } else {
      console.log(`Recipient ${to} is not online`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // Find and remove the user from the active list on disconnect
    for (const [username, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[username];
        console.log(`${username} disconnected and removed from mapping`);
        break;
      }
    }
  });
});
