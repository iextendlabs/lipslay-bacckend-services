const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const ReviewImage = sequelize.define('ReviewImage', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  review_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'review_images',
  timestamps: false
});

module.exports = ReviewImage;