const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderShema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, requires: true },
    },
  ],
  user: {
    email: { type: String, required: true },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
});

module.exports = mongoose.model("Order", orderShema);
// const Sqeuelize = require("sequelize");
// const sequelize = require("../utils/data");

// const Order = sequelize.define("order", {
//   id: {
//     type: Sqeuelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true,
//   },
// });
// module.exports = Order;
