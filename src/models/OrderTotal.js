const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const OrderTotal = sequelize.define('OrderTotal', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  order_id: DataTypes.BIGINT,
  sub_total: DataTypes.DECIMAL(10,2),
  discount: DataTypes.DECIMAL(10,2),
  staff_charges: DataTypes.DECIMAL(10,2),
  transport_charges: DataTypes.DECIMAL(10,2),
  total_amount: DataTypes.DECIMAL(10,2)
}, {
  tableName: 'order_totals',
  timestamps: false
});

module.exports = OrderTotal;
