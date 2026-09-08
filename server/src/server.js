import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";
import { readDb } from "./storage/localStore.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

app.use(express.json());

app.get("/health", (req, res) => {
	res.json({ status: "ok", service: "RupeeStop FIFO Tax Engine" });
});

app.use("/api", apiRoutes);

app.use((err, req, res, next) => {
	console.error("Unhandled Server Error:", err);
	res.status(500).json({
		success: false,
		message: err.message || "Internal Server Error",
	});
});

readDb();

app.listen(PORT, () => {
	console.log(`📡 RupeeStop Backend API available at: http://localhost:${PORT}/api`);
});

export default app;
