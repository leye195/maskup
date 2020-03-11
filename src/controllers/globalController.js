import axios from "axios";
export const home = (req, res) => {
  res.render("home", { pageTitle: "MaskUp" });
};
