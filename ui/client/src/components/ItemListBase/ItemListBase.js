import React from "react";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";

class ItemListBase extends React.Component {
  render() {
    const {
      items,
      getItemData,
      getItemAction,
      childCmp,
    } = this.props;
    return (
      <List>
        {items.map(item => (
          <ListItem key={item.key}>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.key +
              (getItemData(item.key, childCmp) ?
                ' [' + getItemData(item.key, childCmp) + item.unit + ']' : '')} />
            <ListItemSecondaryAction>
              {getItemAction(item.key, childCmp)}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  }
};

export default ItemListBase;
