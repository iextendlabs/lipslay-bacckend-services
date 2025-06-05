const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Setting = sequelize.define('Setting', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  key: DataTypes.STRING,
  value: DataTypes.TEXT
}, {
  tableName: 'settings',
  timestamps: false
});

module.exports = Setting;