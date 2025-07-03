const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const SubTitle = sequelize.define('SubTitle', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'sub_titles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SubTitle;