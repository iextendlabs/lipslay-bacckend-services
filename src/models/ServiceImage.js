const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const ServiceImage = sequelize.define('ServiceImage', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  service_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'service_images',
  timestamps: false
});
module.exports = ServiceImage;