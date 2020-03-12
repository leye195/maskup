import { getAPIData, getPlaceCoords } from "./mask";
(() => {
  //map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴
  const container = document.getElementById("map"), //지도를 담을 영역의 DOM 레퍼런스
    gpsBtn = document.querySelector(".gps-button"),
    searchBar = document.querySelector("#search");
  let map = null,
    input = "",
    infowin = null,
    clickedOverlay = null;
  const initMap = () => {
    const options = {
      //지도를 생성할 때 필요한 기본 옵션
      center: new kakao.maps.LatLng(36.82170954976736, 127.2220151649409), //지도의 중심좌표.
      level: 12, //지도의 레벨(확대, 축소 정도)
      scrollwheel: true
    };
    map = new kakao.maps.Map(container, options);
    map.setMinLevel(2);
    map.setMaxLevel(12);
  };
  const handleSearch = async e => {
    const {
      target: { value }
    } = e;
    input = value;
    try {
      //onst data = await getPlaceCoords(input);
      //console.log(data);
      let ps = new kakao.maps.services.Places();
      ps.keywordSearch(input, placeSearchCB);
    } catch (e) {
      console.log(e);
    } finally {
      e.target.value = "";
      e.target.blur();
    }
  };

  const placeSearchCB = (data, status, pagination) => {
    if (status === kakao.maps.services.Status.OK) {
      // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
      // LatLngBounds 객체에 좌표를 추가
      const bounds = new kakao.maps.LatLngBounds();
      for (let i = 0; i < data.length; i++) {
        bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
      }
      map.setBounds(bounds); //검색 위치를 기준으로 지도 범위 설정
      map.setLevel(4);
      const { Ga, Ha } = map.getCenter();
      mapPins(Ha, Ga);
    }
  };
  const getInfoWinTag = obj => {
    const wrap = document.createElement("div"),
      info = document.createElement("div"),
      title = document.createElement("div"),
      close = document.createElement("div"),
      body = document.createElement("div"),
      desc = document.createElement("div"),
      status = document.createElement("div"),
      stockAt = document.createElement("div"),
      addr = document.createElement("a");

    status.className = `status ${obj.remain_stat}`;
    addr.className = "addr";
    desc.className = "desc";
    close.className = "close";
    title.className = "title";
    info.className = "info";
    wrap.className = "wrap";

    close.innerText = `❌`;
    title.innerText = `${obj.title}`;
    stockAt.innerText = `입고시간: ${obj.stock_at}`;
    status.innerText = `재고상태: ${
      obj.remain_stat === "empty"
        ? "품절"
        : obj.remain_stat === "few"
        ? "적음(1~29개)"
        : obj.remain_stat === "some"
        ? "양호(30~99개)"
        : "많음(100개이상)"
    }`;
    addr.innerText = `${obj.addr}`;
    addr.href = `https://map.kakao.com/link/to/${obj.title},${obj.latlng.Ha},${obj.latlng.Ga}`;

    close.addEventListener("click", closeOverlay);
    desc.appendChild(status);
    desc.appendChild(stockAt);
    desc.appendChild(addr);
    body.appendChild(desc);
    title.appendChild(close);
    info.appendChild(title);
    info.appendChild(body);
    wrap.appendChild(info);

    return wrap;
  };
  const handleClickMarker = (marker, info) => {
    if (clickedOverlay) {
      clickedOverlay.setMap(null);
    }
    infowin = new kakao.maps.CustomOverlay({
      content: getInfoWinTag(info),
      position: marker.getPosition(),
      clickable: true,
      zIndex: 3
    });
    infowin.setMap(map);
    clickedOverlay = infowin;
  };
  const closeOverlay = () => {
    if (clickedOverlay) {
      clickedOverlay.setMap(null);
      clickedOverlay = null;
    }
  };

  //좌표 마크 데이터에 표시 진행
  const mapPins = async (latitude, longitude) => {
    try {
      let response = await getAPIData(latitude, longitude, 1500);
      const stores = response.data.stores;
      //console.log(stores[0]);
      const positions = stores.map(item => {
        return {
          addr: item.addr,
          code: item.code,
          createdAt: item.created_at,
          title: item.name,
          remain_stat: item.remain_stat,
          stock_at: item.stock_at,
          latlng: new kakao.maps.LatLng(item.lat, item.lng)
        };
      });
      let imgSrc = "";
      const imgSize = new kakao.maps.Size(24, 30);

      for (let i = 0; i < positions.length; i++) {
        if (positions[i].remain_stat === "empty") {
          imgSrc = "/static/img/marker-grey.png";
        } else if (positions[i].remain_stat === "few") {
          imgSrc = "/static/img/marker-red.png";
        } else if (positions[i].remain_stat === "some") {
          imgSrc = "/static/img/marker-yellow.png";
        } else if (positions[i].remain_stat === "plenty") {
          imgSrc = "/static/img/marker-green.png";
        }
        let markerImg = new kakao.maps.MarkerImage(imgSrc, imgSize);
        let marker = new kakao.maps.Marker({
          map: map,
          position: positions[i].latlng,
          title: positions[i].title,
          image: markerImg
        });
        kakao.maps.event.addListener(marker, "click", () => {
          handleClickMarker(marker, positions[i]);
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const saveCoords = (lat, lng) => {
    if (!localStorage.getItem("latlng")) {
      //저장된 위치 데이터가 없을경우
      localStorage.setItem("latlng", JSON.stringify({ lat, lng }));
    } else {
      const prevCoords = JSON.parse(localStorage.getItem("latlng"));
      if (prevCoords.lat !== lat || prevCoords.lng !== lng) {
        //현재 위치와 저장된 위치 비교
        localStorage.setItem("latlng", JSON.stringify({ lat, lng }));
      }
    }
  };
  const getCoords = () => {
    if (localStorage.getItem("latlng"))
      return JSON.parse(localStorage.getItem("latlng"));
  };
  const getPosition = pos => {
    saveCoords(pos.coords.latitude, pos.coords.longitude);
    kakao.maps.event.addListener(map, "dragend", () => {
      let latlng = map.getCenter();
      mapPins(latlng.getLat(), latlng.getLng());
    });
  };
  const handlePositionError = e => {
    console.log("위치 좌표를 불러올수 없습니다.");
    console.log(e);
  };
  const getCurrentCoord = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        getPosition,
        handlePositionError
      );
    }
  };
  const panTo = e => {
    const coords = getCoords();
    const moveLatLng = new kakao.maps.LatLng(coords.lat, coords.lng);
    map.setLevel(4);
    map.panTo(moveLatLng);
    mapPins(coords.lat, coords.lng);
  };
  const init = () => {
    initMap();
    getCurrentCoord();
    gpsBtn.addEventListener("click", panTo);
    searchBar.addEventListener("change", handleSearch);
  };
  init();
})();
