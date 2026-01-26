import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://jandrishti-admin.netlify.app",
    "https://jandrishti-user.netlify.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();


app.get("/", (req, res) => {
  res.status(200).json({ status: "JanDrishti API running 🚀" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin", adminRoutes);


const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://jandrishti-admin.netlify.app",
      "https://jandrishti-user.netlify.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running on port ${PORT}`);
});
