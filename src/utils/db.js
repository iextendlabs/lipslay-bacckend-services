const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('lisplay', 'root', 'yourpassword', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;