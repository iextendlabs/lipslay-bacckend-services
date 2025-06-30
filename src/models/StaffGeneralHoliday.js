const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const StaffGeneralHoliday = sequelize.define('StaffGeneralHoliday', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  staff_id: DataTypes.BIGINT,
  day: DataTypes.STRING,
  status: DataTypes.BOOLEAN
}, {
  tableName: 'staff_general_holidays',
  timestamps: false
});

module.exports = StaffGeneralHoliday;