import express from "express";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { localMiddleware } from "./middlewares";
import globalRoute from "./routes/globalRoute";
dotenv.config();

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(helmet());
app.use(cors());
app.use("/static", express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(localMiddleware);
app.use("/", globalRoute);

app.listen(process.env.PORT, () => {
  console.log(`Express is running on PORT:${process.env.PORT}`);
});
