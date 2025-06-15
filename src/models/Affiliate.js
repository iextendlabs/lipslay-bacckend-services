const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Affiliate = sequelize.define('Affiliate', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  parent_affiliate_id: { type: DataTypes.BIGINT, allowNull: true },
  code: { type: DataTypes.STRING, allowNull: true },
  user_id: { type: DataTypes.BIGINT, allowNull: true }
}, {
  tableName: 'affiliates',
  timestamps: false
});

module.exports = Affiliate;
