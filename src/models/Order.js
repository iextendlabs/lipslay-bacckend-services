const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  customer_id: DataTypes.BIGINT.UNSIGNED,
  customer_name: DataTypes.STRING,
  customer_email: DataTypes.STRING,
  total_amount: DataTypes.DECIMAL(8, 2),
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: DataTypes.STRING,
  affiliate_id: DataTypes.BIGINT.UNSIGNED,
  buildingName: DataTypes.STRING,
  area: DataTypes.STRING,
  landmark: {
    type: DataTypes.STRING,
    allowNull: false
  },
  flatVilla: DataTypes.STRING,
  street: DataTypes.STRING,
  city: DataTypes.STRING,
  district: DataTypes.STRING,
  number: DataTypes.STRING,
  whatsapp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  service_staff_id: DataTypes.BIGINT.UNSIGNED,
  staff_name: DataTypes.STRING,
  date: DataTypes.STRING,
  time_slot_id: DataTypes.BIGINT.UNSIGNED,
  time_slot_value: DataTypes.STRING,
  latitude: DataTypes.STRING,
  longitude: DataTypes.STRING,
  order_comment: DataTypes.TEXT,
  driver_comment: DataTypes.TEXT,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
  driver_status: DataTypes.STRING,
  time_start: DataTypes.TIME,
  time_end: DataTypes.TIME,
  gender: DataTypes.STRING,
  driver_id: DataTypes.BIGINT.UNSIGNED,
  order_source: DataTypes.STRING,
  currency_symbol: DataTypes.STRING,
  currency_rate: DataTypes.DECIMAL(10, 2),
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Order;

