const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const CustomerProfile = sequelize.define('CustomerProfile', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  buildingName: DataTypes.STRING,
  area: DataTypes.STRING,
  landmark: DataTypes.STRING,
  flatVilla: DataTypes.STRING,
  street: DataTypes.STRING,
  city: DataTypes.STRING,
  district: DataTypes.STRING,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'customer_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CustomerProfile;
