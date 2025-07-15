const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Currency = sequelize.define('Currency', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  symbol: { type: DataTypes.STRING, allowNull: false },
  rate: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'currencies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Currency;