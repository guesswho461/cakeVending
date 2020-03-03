import axios from "axios";

// import companyInfo from "../../companyInfo";

const SET_PAGE_SELECTED = "set/page/selected";
const OPEN_CHECKOUT_DLG = "open/checkoutdlg";
const CLOSE_CHECKOUT_DLG = "close/checkoutdlg";
const COIN_VALUE_DEC = "coin/value/dec";
const SET_ADPAGE_TITLE = "set/adPage/title";
const SET_ORIGINAL_RECIPE_START = "set/originalRecipe/start";
const SET_HEATINGUP_WARNING_DLG_OPEN = "set/heatingupWarningDlg/open";
const SET_HEATINGUP_WARNING_DLG_CLOSE = "set/heatingupWarningDlg/close";
const SET_MAKING_PROGRESS = "set/makingProgress";

const initState = {
  selectedPage: "ad",
  adPageTitle: "touch2BuyText",
  checkoutDlgOpen: false,
  coinValue: 0,
  ovenIsReady: false,
  heatingUpWarningDlgOpen: false,
  takeCakeWarningDlgOpen: false,
  checkoutDone: false,
  makingProgress: 0
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

export default function reducer(state = initState, action) {
  switch (action.type) {
    default:
      return state;
    case COIN_VALUE_DEC:
      return {
        ...state,
        coinValue: decTheCoinValue(state.coinValue, action.payload),
        checkoutDone: true
      };
    case SET_PAGE_SELECTED:
      return {
        ...state,
        selectedPage: action.payload
      };
    case OPEN_CHECKOUT_DLG:
      return {
        ...state,
        checkoutDlgOpen: true,
        checkoutDone: false
      };
    case CLOSE_CHECKOUT_DLG:
      return {
        ...state,
        checkoutDlgOpen: false
      };
    case SET_ADPAGE_TITLE:
      return {
        ...state,
        adPageTitle: action.payload
      };
    case SET_HEATINGUP_WARNING_DLG_OPEN:
      return {
        ...state,
        heatingUpWarningDlgOpen: true
      };
    case SET_HEATINGUP_WARNING_DLG_CLOSE:
      return {
        ...state,
        heatingUpWarningDlgOpen: false
      };
    case "oven/status/tempature":
      return {
        ...state,
        ovenIsReady: checkOvenIsReady(action.payload)
      };
    case "coin/status/inc":
      return {
        ...state,
        coinValue: incTheCoinValue(state.coinValue)
      };
    case "gate/cmd/open":
      if (action.payload === "true") {
        return {
          ...state,
          takeCakeWarningDlgOpen: true,
          makingProgress: 100,
          adPageTitle: "completeBake"
        };
      } else {
        return {
          ...state,
          takeCakeWarningDlgOpen: false,
          selectedPage: "main",
          checkoutDone: false,
          makingProgress: 0,
          adPageTitle: "touch2BuyText"
        };
      }
    case SET_MAKING_PROGRESS:
      return {
        ...state,
        makingProgress: action.payload
      };
  }
}

export function handleMQTTSubscribeTopics(topic, msg) {
  return {
    type: topic,
    payload: msg.toString()
  };
}

export function setPageSelected(data) {
  return {
    type: SET_PAGE_SELECTED,
    payload: data
  };
}

export function setCheckoutDlgOpen() {
  return {
    type: OPEN_CHECKOUT_DLG
  };
}

export function setCheckoutDlgClose() {
  return {
    type: CLOSE_CHECKOUT_DLG
  };
}

export function coinValueDec(data) {
  return {
    type: COIN_VALUE_DEC,
    payload: data
  };
}

export function setOriginalRecipeStart() {
  // return dispatch =>
  //   axios
  //     .post(companyInfo.backendURL + "/recipe/start/original")
  //     .then(res => {
  //       console.log(res);
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });
  return {
    type: SET_ORIGINAL_RECIPE_START
  };
}

export function setADPageTitle(data) {
  return {
    type: SET_ADPAGE_TITLE,
    payload: data
  };
}

export function setHeadtingUpWarningDlgOpen() {
  return {
    type: SET_HEATINGUP_WARNING_DLG_OPEN
  };
}

export function setHeadtingUpWarningDlgClose() {
  return {
    type: SET_HEATINGUP_WARNING_DLG_CLOSE
  };
}

export function setMakingProgress(data) {
  return {
    type: SET_MAKING_PROGRESS,
    payload: data
  };
}
