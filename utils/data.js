const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://rishabhram:rishabhrai@cluster0.bmpbv.mongodb.net/shop?retryWrites=true&w=majority",
    { useUnifiedTopology: true }
  )
    .then((client) => {
      console.log("connected");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "no databse found";
};
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
//==================================================Sequalize=====================================
// const Sequelize = require("sequelize");
// const sequelize = new Sequelize("node-schemas", "root", "rishabh1234", {
//   dialect: "mysql",
//   host: "localhost",
// });
// module.exports = sequelize;
