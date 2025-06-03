const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Faq = sequelize.define('Faq', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  category_id: DataTypes.BIGINT.UNSIGNED,
  question: DataTypes.TEXT,
  answer: DataTypes.TEXT,
  service_id: DataTypes.BIGINT.UNSIGNED,
  status: DataTypes.STRING
}, {
  tableName: 'faqs',
  timestamps: false
});

module.exports = Faq;