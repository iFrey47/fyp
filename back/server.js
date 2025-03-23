import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";
// import connectDB from "./config/db";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

config();
connectDB();

app.use(express.json());

app.use("/api/auth", authRoutes);

// Middleware
// app.use(cors({ origin: "http://localhost:5173" }));

app.options("*", cors());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
