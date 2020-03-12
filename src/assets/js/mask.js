import axios from "axios";
export const getPlaceCoords = async query => {
  const api = axios.create({
    headers: {
      Authorization: `KakaoAK 5bc8cf098f6dad40fe1871ed9bf5f2cf`
    }
  });
  return await api.get(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${query}`
  );
};
export const getAPIData = async (lat, lng, m = 1000) => {
  return await axios.get(
    `https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByGeo/json?lat=${lat}&lng=${lng}&m=${m}`
  );
};
