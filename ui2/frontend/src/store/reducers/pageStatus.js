import axios from "axios";

// import companyInfo from "../../companyInfo";

const OPEN_CHECKOUT_DLG = "open/checkoutdlg";
const CLOSE_CHECKOUT_DLG = "close/checkoutdlg";
const COIN_VALUE_DEC = "coin/value/dec";

const initState = {
  selectedPage: "main",
  lastPage: "main",
  selectedIdx: 0,
  adPageTitle: "touch2BuyText",
  checkoutDlgOpen: false,
  coinValue: 0
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    default:
      return state;
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

export function setCheckoutDlgOpen(dta) {
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
  return {};
}
