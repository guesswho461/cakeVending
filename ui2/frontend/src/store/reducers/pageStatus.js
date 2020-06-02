import axios from "axios";

import UIfx from "uifx";
import beep from "../../sounds/beep.wav";
const beepSfx = new UIfx(beep);

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

const backend = "http://localhost:8081";

const initState = {
  selectedPage: "ad",
  adPageTitle: "touch2BuyText",
  checkoutDlgOpen: false,
  coinValue: 0,
  coinProgress: 0,
  ovenIsReady: true,
  heatingUpWarningDlgOpen: false,
  takeCakeWarningDlgOpen: false,
  checkoutDone: false,
  makingProgress: 0,
  videoPlayList: [
    "/home/guesswho/Downloads/demoMP4/DLP_PART_2_768k.mp4",
    "/home/guesswho/Downloads/demoMP4/P6090053.mp4",
  ],
  checkoutDlgTitle: "plsInsertCoin",
  showRecipeProgress: false,
};

function checkOvenIsReady(tempature) {
  const parsed = parseInt(tempature, 10);
  return parsed >= 180 ? true : false;
}

function decTheCoinValue(coinValue, data) {
  return coinValue - data;
}

function incTheCoinValue(coinValue) {
  return coinValue + 10;
}

function post(url) {
  axios({
    method: "post",
    baseURL: backend + url,
    headers: {
      Authorization: "Bearer " + process.env.REACT_APP_CAKE_ACCESS_TOKEN,
    },
  })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

function checkOvenTemperatureCmd(data) {
  const temperatureCmd = parseInt(data, 10);
  if (temperatureCmd <= 30) {
    post("/kanban/disable");
    return "maintain";
  } else {
    post("/kanban/enable");
    return "ad";
  }
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
      post("/coin/enable");
      return {
        ...state,
        checkoutDlgOpen: true,
        checkoutDone: false,
      };
    case CLOSE_CHECKOUT_DLG:
      post("/coin/disable");
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
    case "oven/status/tempature":
      return {
        ...state,
        ovenIsReady: checkOvenIsReady(action.payload),
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
          selectedPage: "main",
          checkoutDone: false,
          makingProgress: 0,
          adPageTitle: "touch2BuyText",
        };
      }
    case SET_MAKING_PROGRESS:
      beepSfx.play();
      return {
        ...state,
        makingProgress: action.payload,
      };
    case GET_VIDEO_PLAYLIST:
      return {
        ...state,
        // videoPlayList: action.payload,
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
    case "oven/cmd/temperature":
      return {
        ...state,
        selectedPage: checkOvenTemperatureCmd(action.payload.toString()),
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
  return {
    type: OPEN_CHECKOUT_DLG,
  };
}

export function setCheckoutDlgClose() {
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
    }).then((res) => {
      dispatch({
        type: GET_VIDEO_PLAYLIST,
        payload: res.data,
      });
    });
  };
}

export function setCheckoutDlgTitle(data) {
  return {
    type: SET_CHECKOUTDLG_TITLE,
    payload: data,
  };
}
