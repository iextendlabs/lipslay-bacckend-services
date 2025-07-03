const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const StaffSubTitle = sequelize.define('StaffSubTitle', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  staff_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  sub_title_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'staff_sub_title',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StaffSubTitle;