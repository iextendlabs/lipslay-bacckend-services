const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Service = sequelize.define('Service', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  short_description: DataTypes.TEXT,
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  duration: DataTypes.STRING,
  image: DataTypes.STRING,
  category_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  discount:  {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: DataTypes.STRING,
  type: DataTypes.STRING,
  quote: DataTypes.INTEGER,
  pipelineId: DataTypes.BIGINT.UNSIGNED,
  meta_title: DataTypes.STRING,
  meta_description: DataTypes.TEXT,
  meta_keywords: DataTypes.TEXT,
  slug: DataTypes.STRING
}, {
  tableName: 'services',
  timestamps: false
});

module.exports = Service;