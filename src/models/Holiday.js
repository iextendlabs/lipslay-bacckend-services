const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Holiday = sequelize.define('Holiday', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  date: DataTypes.DATEONLY
}, {
  tableName: 'holidays',
  timestamps: false
});

module.exports = Holiday;