import React from "react";
import ListItem from "@material-ui/core/ListItem";
import { Localize } from "react-redux-i18n";
import Slide from "@material-ui/core/Slide";
import Grow from "@material-ui/core/Grow";
import styled, { keyframes } from "styled-components";
import { flash, fadeInLeft } from "react-animations";

import TouchAppIcon from "@material-ui/icons/TouchApp";
import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
import DoubleArrownIcon from "@material-ui/icons/DoubleArrow";

export const ListItemLink = (props) => {
  return <ListItem button component="a" {...props} />;
};

export const TransitionSlideDown = (props) => {
  return <Slide direction={"down"} {...props} />;
};

export const TransitionGrow = (props) => {
  return <Grow {...props} />;
};

export const i18nDigit = (data, minFraction) => {
  return (
    <Localize
      value={data}
      options={{
        minimumFractionDigits: minFraction,
        maximumFractionDigits: 3,
      }}
    />
  );
};

export const i18nCurrency = (data) => {
  return (
    <Localize
      value={60}
      options={{
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }}
    />
  );
};

const FlashAnimation = keyframes`${flash}`;
const FlashDiv = styled.div`
  animation: infinite 4s ${FlashAnimation};
`;
export const FlashTouchAppIcon = (props) => {
  return (
    <FlashDiv>
      <TouchAppIcon {...props} />
    </FlashDiv>
  );
};

export const FlashMonetizationOnIcon = (props) => {
  return (
    <FlashDiv>
      <MonetizationOnIcon {...props} />
    </FlashDiv>
  );
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: infinite 2s ${FadeInLeftAnimation};
`;
export const BounceInLeftDoubleArrownIcon = (props) => {
  return (
    <FadeInLeftDiv>
      <DoubleArrownIcon {...props} />
    </FadeInLeftDiv>
  );
};

const backend = "http://localhost:8081";

export const GetFromBackend = (url, cb) => {
  return fetch(backend + url, {
    method: "GET",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.REACT_APP_CAKE_ACCESS_TOKEN,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (cb) {
        cb(data);
      }
    })
    .catch((e) => {
      console.log(e);
    });
};
