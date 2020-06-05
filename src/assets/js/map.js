import { getAPIData } from "./mask";
import moment from "moment";
(() => {
  //map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴
  const container = document.getElementById("map"), //지도를 담을 영역의 DOM 레퍼런스
    gpsBtn = document.querySelector(".gps-button"),
    searchBar = document.querySelector("#search"),
    toggleBar = document.querySelector(".toggle-bar-container");
  let map = null,
    input = "",
    infowin = null,
    clickedOverlay = null,
    onSaleOnly = false,
    markers = [];
  const initMap = () => {
    let coords = getCoords();
    if (coords) {
      const options = {
        //지도를 생성할 때 필요한 기본 옵션
        center: new kakao.maps.LatLng(coords.lat, coords.lng), //지도의 중심좌표.
        level: 4, //지도의 레벨(확대, 축소 정도)
        scrollwheel: true,
      };
      map = new kakao.maps.Map(container, options);
      mapPins(coords.lat, coords.lng);
    } else {
      const options = {
        //지도를 생성할 때 필요한 기본 옵션
        center: new kakao.maps.LatLng(36.82170954976736, 127.2220151649409), //지도의 중심좌표.
        level: 12, //지도의 레벨(확대, 축소 정도)
        scrollwheel: true,
      };
      map = new kakao.maps.Map(container, options);
    }
    map.setMinLevel(2);
    map.setMaxLevel(12);
  };
  const handleSearch = async (e) => {
    const {
      target: { value },
    } = e;
    input = value;
    try {
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
      for (let i = 0; i < data.length; i++)
        bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
      map.setBounds(bounds); //검색 위치를 기준으로 지도 범위 설정
      map.setLevel(4);
      const { Ga, Ha } = map.getCenter();
      mapPins(Ha, Ga);
    }
  };
  const getInfoWinTag = (obj) => {
    const wrap = document.createElement("div"),
      info = document.createElement("div"),
      title = document.createElement("div"),
      close = document.createElement("div"),
      body = document.createElement("div"),
      desc = document.createElement("div"),
      status = document.createElement("div"),
      stockAt = document.createElement("div"),
      createdAt = document.createElement("p"),
      addr = document.createElement("a");
    const now = moment(),
      updated = moment(obj.createdAt);

    status.className = `status ${obj.remain_stat}`;
    addr.className = "addr";
    desc.className = "desc";
    close.className = "close";
    title.className = "title";
    info.className = "info";
    wrap.className = "wrap";
    createdAt.className = "created-at";

    close.innerText = `❌`;
    title.innerText = `${obj.title}`;
    stockAt.innerText = `입고시간: ${obj.stock_at ? obj.stock_at : ""}`;
    status.innerText = `${
      obj.remain_stat === null
        ? "정보❌"
        : obj.remain_stat === "break"
        ? "판매 중지"
        : obj.remain_stat === "empty"
        ? "품절"
        : obj.remain_stat === "few"
        ? "적음(1~29개)"
        : obj.remain_stat === "some"
        ? "양호(30~99개)"
        : "많음(100개이상)"
    }`;
    createdAt.innerText = `${moment
      .duration(now.diff(updated))
      .minutes()} 분 전 업데이트`;
    addr.innerText = `길찾기`;
    addr.href = `https://map.kakao.com/link/to/${obj.title},${obj.latlng.Ha},${obj.latlng.Ga}`;

    close.addEventListener("click", closeOverlay);
    desc.appendChild(status);
    desc.appendChild(stockAt);
    desc.appendChild(createdAt);
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
      zIndex: 3,
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
      const positions = stores.map((item) => {
        return {
          addr: item.addr,
          code: item.code,
          createdAt: item.created_at,
          title: item.name,
          remain_stat: item.remain_stat,
          stock_at: item.stock_at,
          latlng: new kakao.maps.LatLng(item.lat, item.lng),
        };
      });
      let imgSrc = "";
      const imgSize = new kakao.maps.Size(50, 50);
      for (let i = 0; i < positions.length; i++) {
        if (positions[i].remain_stat === "break") {
          imgSrc = "/static/img/white-marker.svg";
        } else if (positions[i].remain_stat === "empty") {
          imgSrc = "/static/img/grey-marker.svg";
        } else if (positions[i].remain_stat === "few") {
          imgSrc = "/static/img/red-marker.svg";
        } else if (positions[i].remain_stat === "some") {
          imgSrc = "/static/img/yellow-marker.svg";
        } else if (positions[i].remain_stat === "plenty") {
          imgSrc = "/static/img/green-marker.svg";
        } else {
        }
        let markerImg = new kakao.maps.MarkerImage(imgSrc, imgSize);
        let marker = new kakao.maps.Marker({
          map: map,
          position: positions[i].latlng,
          title: positions[i].title,
          image: markerImg,
        });
        if (
          positions[i].remain_stat === "empty" ||
          positions[i].remain_stat === "break" ||
          positions[i].remain_stat === null
        ) {
          markers.push(marker);
        }
        kakao.maps.event.addListener(marker, "click", () => {
          handleClickMarker(marker, positions[i]);
        });
      }
      if (onSaleOnly) hideMarkers();
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
    return null;
  };
  const getPosition = (pos) => {
    saveCoords(pos.coords.latitude, pos.coords.longitude);
    kakao.maps.event.addListener(map, "dragend", () => {
      let latlng = map.getCenter();
      mapPins(latlng.getLat(), latlng.getLng());
    });
  };
  const handlePositionError = (e) => {
    console.log("위치 좌표를 불러올수 없습니다.");
    console.log(e);
  };
  const getCurrentCoord = async () => {
    if (navigator.geolocation) {
      await navigator.geolocation.getCurrentPosition(
        getPosition,
        handlePositionError
      );
    }
  };
  const panTo = (e) => {
    getCurrentCoord();
    const coords = getCoords();
    const moveLatLng = new kakao.maps.LatLng(coords.lat, coords.lng);
    map.setLevel(4);
    map.panTo(moveLatLng);
    mapPins(coords.lat, coords.lng);
  };
  const onToggleBar = (e) => {
    const toggleBtn = toggleBar.querySelector(".fas");
    if (toggleBtn.classList.contains("fa-toggle-off")) {
      toggleBtn.classList.remove("fa-toggle-off");
      toggleBtn.classList.add("fa-toggle-on");
      hideMarkers();
    } else {
      toggleBtn.classList.add("fa-toggle-off");
      toggleBtn.classList.remove("fa-toggle-on");
      showAllMarkers();
    }
    onSaleOnly = !onSaleOnly;
  };
  const setMarkers = (map) => {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  };
  const showAllMarkers = () => {
    setMarkers(map);
  };
  const hideMarkers = () => {
    setMarkers(null);
  };
  const init = () => {
    window.addEventListener("load", () => {
      document.body.classList.remove("before-loading");
      initMap();
      getCurrentCoord();
      gpsBtn.addEventListener("click", panTo);
      searchBar.addEventListener("change", handleSearch);
      toggleBar.addEventListener("click", onToggleBar);
    });
  };
  init();
})();
