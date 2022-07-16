const { Sequelize } = require('sequelize');

const host = process.env.DBHOST;
const db = process.env.DBNAME;
const user = process.env.DBUSERNAME;
const password = process.env.DBPASSWORD;

const sequelize = new Sequelize( db, user, password, {
  host: 'localhost',
  dialect: "mysql"
});

module.exports = sequelize;