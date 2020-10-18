const Sqeuelize = require("sequelize");
const sequelize = require("../utils/data");

const Cart = sequelize.define("cart", {
  id: {
    type: Sqeuelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});
module.exports = Cart;
