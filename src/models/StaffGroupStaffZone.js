const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const StaffGroupStaffZone = sequelize.define('StaffGroupStaffZone', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  staff_group_id: DataTypes.BIGINT.UNSIGNED,
  staff_zone_id: DataTypes.BIGINT.UNSIGNED,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'staff_group_staff_zone',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StaffGroupStaffZone;