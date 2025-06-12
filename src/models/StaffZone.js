const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const StaffZone = sequelize.define('StaffZone', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING
}, {
  tableName: 'staff_zones',
  timestamps: false
});

module.exports = StaffZone;