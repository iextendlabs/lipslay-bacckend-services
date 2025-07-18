const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Affiliate = sequelize.define('Affiliate', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  membership_plan_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: true },
  commission: { type: DataTypes.DECIMAL(10,2), allowNull: true },
  fix_salary: { type: DataTypes.DECIMAL(8,2), allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true },
  expire: { type: DataTypes.STRING, allowNull: true },
  display_type: { type: DataTypes.STRING, allowNull: true, defaultValue: '1' },
  number: { type: DataTypes.STRING, allowNull: true },
  whatsapp: { type: DataTypes.STRING, allowNull: true },
  parent_affiliate_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  parent_affiliate_commission: { type: DataTypes.STRING, allowNull: true },
  expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
  status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 }
}, {
  tableName: 'affiliates',
  timestamps: false
});

module.exports = Affiliate;
