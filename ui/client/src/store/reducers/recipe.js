import axios from 'axios';

import companyInfo from '../../companyInfo'

const RECIPE_START = "/recipe/start";

const initState = {
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case RECIPE_START:
      axios.post(companyInfo.backendURL + RECIPE_START, {
        cmd: action.payload,
      })
        .then((response) => {
          console.log(response);
        }, (error) => {
          console.log(error);
        });
      console.log(action.type + " - " + action.payload);
      break;
    default:
      return state;
  }
}

export function handleRecipeStart(arg1, arg2) {
  return {
    type: RECIPE_START,
    payload: arg2,
  };
}

