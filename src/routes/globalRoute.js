import express from "express";
import { home, robots } from "../controllers/globalController";
const app = express.Router();
app.get("/", home);
app.get("/robots.txt", robots);
export default app;
