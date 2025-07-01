const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  email_verified_at: DataTypes.DATE,
  password: DataTypes.STRING,
  remember_token: DataTypes.STRING,
  device_token: DataTypes.STRING,
  last_notification_id: DataTypes.STRING,
  customer_source: DataTypes.STRING,
  status: DataTypes.STRING,
  affiliate_program: DataTypes.STRING,
  freelancer_program: DataTypes.STRING,
  last_login_time: DataTypes.DATE,
  login_source: DataTypes.STRING,
  number: DataTypes.STRING,
  whatsapp: DataTypes.STRING,
  gender: DataTypes.STRING
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;