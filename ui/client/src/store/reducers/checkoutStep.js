const CHECKOUT_STEP_INC = "checkoutStep/INCREMENT";
const CHECKOUT_STEP_DEC = "checkoutStep/DECREMENT";
const CHECKOUT_STEP_RESET = "checkoutStep/RESET";

const initState = {
  activeStep: 0
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case CHECKOUT_STEP_INC:
      return {
        ...state,
        activeStep: state.activeStep + 1
      };

    case CHECKOUT_STEP_DEC:
      return {
        ...state,
        activeStep: state.activeStep - 1
      };

    case CHECKOUT_STEP_RESET:
      return {
        ...state,
        activeStep: 0
      };

    default:
      return state;
  }
}

export function checkoutStepInc() {
  return {
    type: CHECKOUT_STEP_INC,
  };
}

export function checkoutStepDec() {
  return {
    type: CHECKOUT_STEP_DEC,
  };
}

export function checkoutStepReset() {
  return {
    type: CHECKOUT_STEP_RESET,
  };
}
