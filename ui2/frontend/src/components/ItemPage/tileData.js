import React from "react";
import { Translate } from "react-redux-i18n";

import demoCake from "../../imgs/demoCake.jpg";

const tileData = [
  {
    img: [demoCake],
    title: [<Translate value="originalFlavorTitle" />],
    price: [<Translate value="originalFlavorPrice" />]
  }
];

export default tileData;
