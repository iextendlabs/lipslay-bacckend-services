const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const ServiceOption = sequelize.define('ServiceOption', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  service_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  option_name: { type: DataTypes.STRING, allowNull: false },
  option_price: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true },
  option_duration: { type: DataTypes.STRING, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'service_options',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ServiceOption;
