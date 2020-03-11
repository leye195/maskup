import express from "express";
import { home } from "../controllers/globalController";
const app = express.Router();
app.get("/", home);
export default app;
