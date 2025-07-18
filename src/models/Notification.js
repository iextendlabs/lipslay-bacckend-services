const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  order_id: DataTypes.BIGINT,
  user_id: DataTypes.BIGINT,
  title: DataTypes.STRING,
  body: DataTypes.STRING,
  type: DataTypes.STRING,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'notifications',
  timestamps: false
});

module.exports = Notification;
