import axios from 'axios';

import companyInfo from '../../companyInfo'

const LOGIN = "authenticate/LOGIN";
const LOGOUT = "authenticate/LOGOUT";
const RESET_LOGIN_OK = "authenticate/RESET";

const initState = {
  engineerMode: true,
  orderDiscount: 0,
  loginOK: false,
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case LOGIN:
      console.log(action.payload);
      axios.get(companyInfo.backendURL).then(
        response => console.log(response)
      );
      return {
        ...state,
        engineerMode: true,
        loginOK: true,
      };

    case LOGOUT:
      return {
        ...state,
        engineerMode: false,
      };

    case RESET_LOGIN_OK:
      return {
        ...state,
        loginOK: false,
      };

    default:
      return state;
  }
}

export function login(data) {
  return {
    type: LOGIN,
    payload: data,
  };
}

export function logout() {
  return {
    type: LOGOUT,
  };
}

export function resetLoginOK() {
  return {
    type: RESET_LOGIN_OK,
  };
}

