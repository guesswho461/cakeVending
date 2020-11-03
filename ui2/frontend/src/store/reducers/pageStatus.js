import axios from "axios";

import UIfx from "uifx";
// import coin from "../../sounds/coin.ogg";
import coin from "../../sounds/beep2.wav";
const coinSfx = new UIfx(coin);

const SET_PAGE_SELECTED = "set/page/selected";
const OPEN_CHECKOUT_DLG = "open/checkoutdlg";
const CLOSE_CHECKOUT_DLG = "close/checkoutdlg";
const COIN_VALUE_DEC = "coin/value/dec";
const SET_ADPAGE_TITLE = "set/adPage/title";
const SET_HEATINGUP_WARNING_DLG_OPEN = "set/heatingupWarningDlg/open";
const SET_HEATINGUP_WARNING_DLG_CLOSE = "set/heatingupWarningDlg/close";
const SET_MAKING_PROGRESS = "set/makingProgress";
const GET_VIDEO_PLAYLIST = "get/videoPlayList";
const SET_CHECKOUTDLG_TITLE = "set/checkoutDlg/title";
const SET_RECIPE_PROGRESS_VISABLE = "set/recipe/progress/visable";
const GET_NEXT_VIDEO_URL = "get/next/video/url";
const SET_PRESS_TO_BAKE_DLG = "set/pressToBake";
const GET_DEV_MODE = "get/devMode";

const backend = "http://localhost:8081";

const initState = {
  selectedPage: "ad",
  adPageTitle: "touch2BuyText",
  checkoutDlgOpen: false,
  coinValue: 0,
  coinProgress: 0,
  heatingUpWarningDlgOpen: false,
  takeCakeWarningDlgOpen: false,
  checkoutDone: false,
  makingProgress: 0,
  videoPlayList: [],
  video: { idx: 0, url: "" },
  checkoutDlgTitle: "plsInsertCoin",
  showRecipeProgress: false,
  pressToBakeDlgOpen: false,
  isDevMode: false,
  maintainPageTitle: "maintainMsg",
};

function decTheCoinValue(coinValue, data) {
  if (coinValue < data) {
    return 0;
  } else {
    return coinValue - data;
  }
}

const coinPerValue = parseInt(process.env.REACT_APP_COIN_PER_VALUE, 10);

function incTheCoinValue(coinValue) {
  coinSfx.play();
  return coinValue + coinPerValue;
}

function post(url) {
  return new Promise((resolve, reject) => {
    axios({
      method: "post",
      baseURL: backend + url,
      headers: {
        Authorization: "Bearer " + process.env.REACT_APP_CAKE_ACCESS_TOKEN,
      },
    })
      .then((res) => {
        console.log(res);
        return resolve(res);
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      });
  });
}

function jump2SoldoutPage(isDevMode, data, lastPage) {
  if (isDevMode) {
    return lastPage;
  } else {
    if (data === "true") {
      post("/kanban/disable");
      return "soldout";
    } else {
      post("/kanban/enable");
      return "ad";
    }
  }
}

function jump2MaintainPage(isDevMode, data, lastPage) {
  if (isDevMode) {
    return lastPage;
  } else {
    if (data === "true") {
      post("/kanban/disable");
      return "maintain";
    } else {
      post("/kanban/enable");
      return "ad";
    }
  }
}

function getNextVideoURLFromVideoList(list, idx) {
  let newIdx = idx + 1;
  if (newIdx >= list.length) {
    newIdx = 0;
  }
  return { idx: newIdx, url: list[newIdx] };
}

export default function reducer(state = initState, action) {
  switch (action.type) {
    default:
      return state;
    case COIN_VALUE_DEC:
      return {
        ...state,
        coinValue: decTheCoinValue(state.coinValue, action.payload),
        checkoutDone: true,
      };
    case SET_PAGE_SELECTED:
      return {
        ...state,
        selectedPage: action.payload,
      };
    case OPEN_CHECKOUT_DLG:
      return {
        ...state,
        checkoutDlgOpen: true,
        checkoutDone: false,
      };
    case CLOSE_CHECKOUT_DLG:
      return {
        ...state,
        checkoutDlgOpen: false,
      };
    case SET_ADPAGE_TITLE:
      return {
        ...state,
        adPageTitle: action.payload,
      };
    case SET_HEATINGUP_WARNING_DLG_OPEN:
      return {
        ...state,
        heatingUpWarningDlgOpen: true,
      };
    case SET_HEATINGUP_WARNING_DLG_CLOSE:
      return {
        ...state,
        heatingUpWarningDlgOpen: false,
      };
    case "frontend/soldout":
      return {
        ...state,
        selectedPage: jump2MaintainPage(
          state.isDevMode,
          action.payload,
          state.selectedPage
        ),
        maintainPageTitle: "soldooutMsg",
      };
    case "frontend/maintain":
      return {
        ...state,
        selectedPage: jump2MaintainPage(
          state.isDevMode,
          action.payload,
          state.selectedPage
        ),
        maintainPageTitle: "maintainMsg",
      };
    case "coin/status/inc":
      return {
        ...state,
        coinValue: incTheCoinValue(state.coinValue),
      };
    case "gate/cmd/open":
      if (action.payload === "true") {
        return {
          ...state,
          takeCakeWarningDlgOpen: true,
          makingProgress: 100,
          adPageTitle: "completeBake",
          showRecipeProgress: false,
        };
      } else {
        return {
          ...state,
          takeCakeWarningDlgOpen: false,
          // selectedPage: "main",
          checkoutDone: false,
          makingProgress: 0,
          adPageTitle: "touch2BuyText",
        };
      }
    case SET_MAKING_PROGRESS:
      return {
        ...state,
        makingProgress: action.payload,
      };
    case GET_VIDEO_PLAYLIST:
      return {
        ...state,
        videoPlayList: action.payload,
        video: { idx: 0, url: action.payload[0] },
      };
    case SET_CHECKOUTDLG_TITLE:
      return {
        ...state,
        checkoutDlgTitle: action.payload,
      };
    case SET_RECIPE_PROGRESS_VISABLE:
      return {
        ...state,
        showRecipeProgress: true,
      };
    case GET_NEXT_VIDEO_URL:
      return {
        ...state,
        video: getNextVideoURLFromVideoList(
          state.videoPlayList,
          state.video.idx
        ),
      };
    case SET_PRESS_TO_BAKE_DLG:
      return {
        ...state,
        pressToBakeDlgOpen: action.payload,
      };
    case GET_DEV_MODE:
      return {
        ...state,
        isDevMode: action.payload,
      };
  }
}

export function handleMQTTSubscribeTopics(topic, msg) {
  return {
    type: topic,
    payload: msg.toString(),
  };
}

export function setPageSelected(data) {
  return {
    type: SET_PAGE_SELECTED,
    payload: data,
  };
}

export function setCheckoutDlgOpen() {
  return (dispatch) => {
    post("/coin/enable")
      .then((res) => {
        dispatch({
          type: OPEN_CHECKOUT_DLG,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
}

export function setCheckoutDlgClose() {
  post("/coin/disable");
  return {
    type: CLOSE_CHECKOUT_DLG,
  };
}

export function coinValueDec(data) {
  return {
    type: COIN_VALUE_DEC,
    payload: data,
  };
}

export function setADPageTitle(data) {
  return {
    type: SET_ADPAGE_TITLE,
    payload: data,
  };
}

export function setHeadtingUpWarningDlgOpen() {
  return {
    type: SET_HEATINGUP_WARNING_DLG_OPEN,
  };
}

export function setHeadtingUpWarningDlgClose() {
  return {
    type: SET_HEATINGUP_WARNING_DLG_CLOSE,
  };
}

export function setMakingProgress(data) {
  return {
    type: SET_MAKING_PROGRESS,
    payload: data,
  };
}

export function setOriginalRecipeStart() {
  post("/recipe/start/original");
  return {
    type: SET_RECIPE_PROGRESS_VISABLE,
  };
}

export function getVideoPlayList() {
  return (dispatch) => {
    axios({
      method: "get",
      baseURL: backend + "/ad/playList",
      headers: {
        Authorization: "Bearer " + process.env.REACT_APP_CAKE_ACCESS_TOKEN,
      },
    })
      .then((res) => {
        dispatch({
          type: GET_VIDEO_PLAYLIST,
          payload: res.data,
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
  };
}

export function setCheckoutDlgTitle(data) {
  return {
    type: SET_CHECKOUTDLG_TITLE,
    payload: data,
  };
}

export function getNextVideoURL() {
  return {
    type: GET_NEXT_VIDEO_URL,
  };
}

export function setPressToBakeDlgOpen() {
  return {
    type: SET_PRESS_TO_BAKE_DLG,
    payload: true,
  };
}

export function setPressToBakeDlgClose() {
  return {
    type: SET_PRESS_TO_BAKE_DLG,
    payload: false,
  };
}

export function getDevMode() {
  return (dispatch) => {
    axios({
      method: "get",
      baseURL: backend + "/devMode",
      headers: {
        Authorization: "Bearer " + process.env.REACT_APP_CAKE_ACCESS_TOKEN,
      },
    })
      .then((res) => {
        dispatch({
          type: GET_DEV_MODE,
          payload: res.data,
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
  };
}

export function isAllOpModesAreCorrect() {
  return (dispatch) => {
    axios({
      method: "get",
      baseURL: backend + "/opModesAreCorrect",
      headers: {
        Authorization: "Bearer " + process.env.REACT_APP_CAKE_ACCESS_TOKEN,
      },
    })
      .then((res) => {
        dispatch({
          type: "frontend/maintain",
          payload: res.data === true ? "false" : "true",
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
  };
}
