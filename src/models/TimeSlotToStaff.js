const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const TimeSlotToStaff = sequelize.define('TimeSlotToStaff', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  time_slot_id: DataTypes.BIGINT.UNSIGNED,
  staff_id: DataTypes.BIGINT.UNSIGNED,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'time_slot_to_staff',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TimeSlotToStaff;