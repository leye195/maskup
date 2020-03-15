import dotenv from "dotenv";
import path from "path";
dotenv.config();
export const home = (req, res) => {
  const KEY = process.env.MAP_API;
  res.render("home", { api: KEY });
};
export const robots = (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
  Disallow: /
  Allow: /$`);
};
export const siteMap = (req, res) => {
  res.type("application/xml");
  res.sendFile(path.join(__dirname, `../static/sitemap.xml`));
};
