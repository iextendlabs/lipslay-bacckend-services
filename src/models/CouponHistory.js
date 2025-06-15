const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const CouponHistory = sequelize.define('CouponHistory', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  coupon_id: DataTypes.BIGINT,
  order_id: DataTypes.BIGINT,
  discount: DataTypes.DECIMAL(10,2),
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'coupon_histories',
  timestamps: false
});

module.exports = CouponHistory;
