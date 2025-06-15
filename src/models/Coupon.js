const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  code: DataTypes.STRING,
  type: DataTypes.STRING,
  coupon_for: DataTypes.STRING
}, {
  tableName: 'coupons',
  timestamps: false
});

module.exports = Coupon;
