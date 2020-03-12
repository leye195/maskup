import axios from "axios";
export const getAPIData = async (lat, lng, m = 1000) => {
  return await axios.get(
    `https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByGeo/json?lat=${lat}&lng=${lng}&m=${m}`
  );
};
