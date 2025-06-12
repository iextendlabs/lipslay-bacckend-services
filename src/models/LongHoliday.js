const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const LongHoliday = sequelize.define('LongHoliday', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  staff_id: DataTypes.BIGINT,
  date_start: DataTypes.DATEONLY,
  date_end: DataTypes.DATEONLY
}, {
  tableName: 'long_holidays',
  timestamps: false
});

module.exports = LongHoliday;