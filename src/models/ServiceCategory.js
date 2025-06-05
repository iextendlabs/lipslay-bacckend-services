const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const Staff = require('./Staff');
const User = require('./User');

const ServiceCategory = sequelize.define('ServiceCategory', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  parent_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  title: DataTypes.STRING,
  image: DataTypes.STRING,
  description: DataTypes.TEXT,
  status: DataTypes.STRING,
  icon: DataTypes.STRING,
  type: DataTypes.STRING,
  meta_title: DataTypes.STRING,
  meta_description: DataTypes.TEXT,
  meta_keywords: DataTypes.TEXT,
  slug: DataTypes.STRING
}, {
  tableName: 'service_categories',
  timestamps: false
});

Staff.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
User.hasOne(Staff, { foreignKey: 'user_id', sourceKey: 'id' });
module.exports = ServiceCategory;