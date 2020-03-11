import express from "express";
import path from "path";
import bodyParser from "body-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import { localMiddleware } from "./middlewares";
dotenv.config();

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use("/static", express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(localMiddleware);

app.get("/", (rea, res) => {
  res.render("home");
});

app.listen(process.env.PORT, () => {
  console.log(`Express is running on PORT:${process.env.PORT}`);
});
