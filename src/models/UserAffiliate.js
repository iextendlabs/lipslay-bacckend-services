const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const UserAffiliate = sequelize.define('UserAffiliate', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  affiliate_id: { type: DataTypes.BIGINT, allowNull: true },
  user_id: { type: DataTypes.BIGINT, allowNull: true }
}, {
  tableName: 'user_affiliate',
  timestamps: false
});

module.exports = UserAffiliate;
