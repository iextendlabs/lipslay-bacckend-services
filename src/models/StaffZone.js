const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const StaffZone = sequelize.define('StaffZone', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  description: DataTypes.STRING,
  transport_charges: DataTypes.STRING,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
  extra_charges: DataTypes.STRING,
  currency_id: DataTypes.BIGINT.UNSIGNED
}, {
  tableName: 'staff_zones',
  timestamps: false
});

module.exports = StaffZone;