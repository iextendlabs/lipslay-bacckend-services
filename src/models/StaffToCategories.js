const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const StaffToCategories = sequelize.define('StaffToCategories', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  staff_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  category_id: {
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
  tableName: 'staff_to_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StaffToCategories;
