const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const ServiceToCategory = sequelize.define('ServiceToCategory', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  service_id: {
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
  tableName: 'service_to_category',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ServiceToCategory;