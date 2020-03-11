import moment from "moment";
const days = {
  1: { day: "월", target: "1,6" },
  2: { day: "화", target: "2,7" },
  3: { day: "수", target: "3,8" },
  4: { day: "목", target: "4,9" },
  5: { day: "금", target: "5,0" },
  6: { day: "토", target: "전체" },
  7: { day: "일", target: "전체" }
};
export const localMiddleware = (req, res, next) => {
  const today = moment();
  res.locals.siteTitle = "마스크's Up";
  //res.locals.api = KEY;
  res.locals.today = days[today.day()];
  next();
};
