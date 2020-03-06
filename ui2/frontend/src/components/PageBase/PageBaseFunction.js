import React from "react";
import ListItem from "@material-ui/core/ListItem";
import { Localize } from "react-redux-i18n";
import Slide from "@material-ui/core/Slide";
import Grow from "@material-ui/core/Grow";

export const ListItemLink = props => {
  return <ListItem button component="a" {...props} />;
};

export const TransitionSlideDown = props => {
  return <Slide direction={"down"} {...props} />;
};

export const TransitionGrow = props => {
  return <Grow {...props} />;
};

export const i18nDigit = (data, minFraction) => {
  return (
    <Localize
      value={data}
      options={{
        minimumFractionDigits: minFraction,
        maximumFractionDigits: 3
      }}
    />
  );
};

export const i18nCurrency = data => {
  return (
    <Localize
      value={60}
      options={{
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }}
    />
  );
};
