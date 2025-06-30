const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const ShortHoliday = sequelize.define('ShortHoliday', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time_start: { type: DataTypes.TIME, allowNull: false },
  hours: { type: DataTypes.INTEGER, allowNull: false },
  staff_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true },
  start_time_to_sec: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: '1' }
}, {
  tableName: 'short_holidays',
  timestamps: false
});

module.exports = ShortHoliday;