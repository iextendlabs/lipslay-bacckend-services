const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  staff_id: DataTypes.BIGINT.UNSIGNED,
  service_id: DataTypes.BIGINT.UNSIGNED,
  content: DataTypes.TEXT,
  rating: DataTypes.INTEGER,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
  user_name: DataTypes.STRING,
  order_id: DataTypes.BIGINT.UNSIGNED,
  video: DataTypes.STRING
}, {
  tableName: 'reviews',
  timestamps: false
});

module.exports = Review;