const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const StaffDriver = sequelize.define('StaffDriver', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  staff_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  driver_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  day: { type: DataTypes.STRING, allowNull: false },
  time_slot_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'staff_drivers',
  timestamps: false
});

module.exports = StaffDriver;
