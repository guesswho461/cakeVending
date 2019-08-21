import axios from 'axios';

import companyInfo from '../../companyInfo'

const GET_VERSION = "/version";

const initState = {
  version: 'v0.0',
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case GET_VERSION:
      axios.get(companyInfo.backendURL + GET_VERSION)
        .then((response) => {
          console.log(response)
          return {
            ...state,
            version: response.data
          };
        }, (error) => {
          console.log(error)
          return {
            ...state,
            version: error
          };
        });
      break;
    default:
      return state;
  }
}

export function getVersion() {
  return {
    type: GET_VERSION,
  };
}

