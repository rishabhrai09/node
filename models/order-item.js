const Sequelize = require("sequelize");
const sequelize = require("../utils/data");
const OrderItem = sequelize.define("oderItem", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});
module.exports = OrderItem;
