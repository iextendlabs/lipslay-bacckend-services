const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const TimeSlot = sequelize.define('TimeSlot', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  time_start: DataTypes.TIME,
  time_end: DataTypes.TIME,
  type: DataTypes.STRING,
  date: DataTypes.DATEONLY,
  status: DataTypes.INTEGER,
  seat: DataTypes.INTEGER
}, {
  tableName: 'time_slots',
  timestamps: false
});

module.exports = TimeSlot;