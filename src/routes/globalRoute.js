import express from "express";
import { home, robots, siteMap } from "../controllers/globalController";
const app = express.Router();
app.get("/", home);
app.get("/robots.txt", robots);
app.get("/sitemap.xml", siteMap);
export default app;
