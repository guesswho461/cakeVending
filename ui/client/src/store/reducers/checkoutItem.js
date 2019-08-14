const CHECKOUT_ITEM_INC = "checkoutItem/INCREMENT";
const CHECKOUT_ITEM_DEC = "checkoutItem/DECREMENT";
const CHECKOUT_ITEM_RESET = "checkoutItem/RESET";

const initState = {
  totalCount: 0,
  totalPrice: 0,
  list: [],
};

function updateList(list, item, type) {
  var idx = -1;
  for (var i = 0; i < list.length; i++) {
    if (list[i].title === item.title) {
      idx = i;
    }
  }
  if (idx < 0) {
    var newItem = {
      title: item.title,
      count: 0,
      subtotal: 0,
      rawData: item,
    };
    list.push(newItem);
    idx = list.length - 1;
  }
  if (type === CHECKOUT_ITEM_INC) {
    list[idx].count = list[idx].count + 1;
  } else {
    if (list[idx].count > 0) {
      list[idx].count = list[idx].count - 1;
    }
  }
  if (list[idx].count <= 0) {
    list.splice(idx, 1);
  } else {
    list[idx].subtotal = list[idx].count * list[idx].rawData.unitPrice;
  }
  return list;
}

function updateTotalCount(list) {
  var count = 0;
  for (var i = 0; i < list.length; i++) {
    count = count + list[i].count;
  }
  return count;
}

function updateTotalPrice(list) {
  var price = 0;
  for (var i = 0; i < list.length; i++) {
    price = price + list[i].subtotal;
  }
  return price;
}

export default function reducer(state = initState, action) {
  switch (action.type) {
    case CHECKOUT_ITEM_INC:
    case CHECKOUT_ITEM_DEC:
      return {
        ...state,
        list: updateList(state.list, action.payload, action.type),
        totalCount: updateTotalCount(state.list),
        totalPrice: updateTotalPrice(state.list),
      };

    case CHECKOUT_ITEM_RESET:
      return {
        ...state,
        list: [],
        totalCount: 0,
        totalPrice: 0,
      };

    default:
      return state;
  }
}

export function checkoutItemInc(data) {
  return {
    type: CHECKOUT_ITEM_INC,
    payload: data,
  };
}

export function checkoutItemDec(data) {
  return {
    type: CHECKOUT_ITEM_DEC,
    payload: data,
  };
}

export function checkoutItemReset() {
  return {
    type: CHECKOUT_ITEM_RESET,
  };
}

