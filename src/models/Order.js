const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  time_slot_id: DataTypes.BIGINT,
  date: DataTypes.DATEONLY,
  status: DataTypes.STRING
}, {
  tableName: 'orders',
  timestamps: false
});

module.exports = Order;