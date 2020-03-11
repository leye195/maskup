import dotenv from "dotenv";
dotenv.config();
export const home = (req, res) => {
  const KEY = process.env.MAP_API;
  res.render("home", { pageTitle: "MaskUp", api: KEY });
};
