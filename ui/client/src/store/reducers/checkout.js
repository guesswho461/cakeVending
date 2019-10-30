const OPEN_CHECKOUT_DLG = "open/checkoutdlg";
const CLOSE_CHECKOUT_DLG = "close/checkoutdlg";

const initState = {
  checkoutDlgOpen: false,
};

export default function reducer(state = initState, action) {
  switch (action.type) {
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
    default:
      return state;
  }
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
