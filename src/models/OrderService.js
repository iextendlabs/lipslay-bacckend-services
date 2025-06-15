const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const OrderService = sequelize.define('OrderService', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  order_id: DataTypes.BIGINT,
  service_id: DataTypes.BIGINT,
  service_name: DataTypes.STRING,
  price: DataTypes.DECIMAL(10,2),
  option_id: DataTypes.STRING,
  option_name: DataTypes.STRING,
  duration: DataTypes.STRING,
  status: DataTypes.STRING
}, {
  tableName: 'order_services',
  timestamps: false
});

module.exports = OrderService;
