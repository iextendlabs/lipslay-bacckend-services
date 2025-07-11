const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const ReviewImage = require('./ReviewImage'); // <-- Add this line

const Review = sequelize.define('Review', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  staff_id: DataTypes.BIGINT.UNSIGNED,
  service_id: DataTypes.BIGINT.UNSIGNED,
  feature: DataTypes.INTEGER,
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

// Add association
Review.hasMany(ReviewImage, { foreignKey: 'review_id', as: 'images' });
ReviewImage.belongsTo(Review, { foreignKey: 'review_id', as: 'review' });

module.exports = Review;