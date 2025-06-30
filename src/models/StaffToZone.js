const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const StaffToZone = sequelize.define('StaffToZone', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  zone_id: DataTypes.BIGINT.UNSIGNED,
  user_id: DataTypes.BIGINT.UNSIGNED,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'staff_to_zone',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StaffToZone;