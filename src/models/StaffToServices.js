const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const StaffToServices = sequelize.define('StaffToServices', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  staff_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  service_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'staff_to_services',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StaffToServices;