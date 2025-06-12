const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const StaffHoliday = sequelize.define('StaffHoliday', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  staff_id: DataTypes.BIGINT,
  date: DataTypes.DATEONLY
}, {
  tableName: 'staff_holidays',
  timestamps: false
});

module.exports = StaffHoliday;