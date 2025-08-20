const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Country = sequelize.define('Country', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'countries',
  timestamps: false
});

module.exports = Country;