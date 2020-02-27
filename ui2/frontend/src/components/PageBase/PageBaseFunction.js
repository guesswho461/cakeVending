import React from "react";
import ListItem from "@material-ui/core/ListItem";
import { Localize } from "react-redux-i18n";

export function ListItemLink(props) {
  return <ListItem button component="a" {...props} />;
}

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
