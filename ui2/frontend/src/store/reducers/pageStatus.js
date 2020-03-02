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
const SET_TAKECAKE_WARNING_DLG_OPEN = "set/takeCakeWarningDlg/open";
const SET_TAKECAKE_WARNING_DLG_CLOSE = "set/takeCakeWarningDlg/close";

const initState = {
  selectedPage: "ad",
  lastPage: "ad",
  selectedIdx: 0,
  adPageTitle: "touch2BuyText",
  checkoutDlgOpen: false,
  coinValue: 0,
  ovenIsReady: false,
  heatingUpWarningDlgOpen: false,
  takeCakeWarningDlgOpen: false
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    default:
      return state;
    case SET_PAGE_SELECTED:
      return {
        ...state,
        selectedPage: action.payload
      };
    case OPEN_CHECKOUT_DLG:
      return {
        ...state,
        checkoutDlgOpen: true
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
    case SET_TAKECAKE_WARNING_DLG_OPEN:
      return {
        ...state,
        takeCakeWarningDlgOpen: true
      };
    case SET_TAKECAKE_WARNING_DLG_CLOSE:
      return {
        ...state,
        takeCakeWarningDlgOpen: false
      };
  }
}

export function handleSubscribeTopics(root, topic, msg) {
  var actionType = "";
  if (typeof topic === "string") {
    var topicArr = topic.split("/");
    if (topicArr[0] === root) {
      actionType = topic;
    }
  }
  return {
    type: actionType,
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

export function setTakeCakeWarningDlgOpen() {
  return {
    type: SET_TAKECAKE_WARNING_DLG_OPEN
  };
}

export function setTakeCakeWarningDlgClose() {
  return {
    type: SET_TAKECAKE_WARNING_DLG_CLOSE
  };
}
