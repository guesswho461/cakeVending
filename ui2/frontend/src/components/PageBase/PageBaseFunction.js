import React from "react";
import ListItem from "@material-ui/core/ListItem";
import { Localize } from "react-redux-i18n";
import Slide from "@material-ui/core/Slide";

export function ListItemLink(props) {
  return <ListItem button component="a" {...props} />;
}

export const DlgTransitionDown = props => {
  return <Slide direction={"down"} {...props} />;
};

export function i18nDigit(data, minFraction) {
  return (
    <Localize
      value={data}
      options={{
        minimumFractionDigits: minFraction,
        maximumFractionDigits: 3
      }}
    />
  );
}

export function i18nCurrency(data) {
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
}
