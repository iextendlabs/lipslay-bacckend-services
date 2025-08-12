const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Staff = sequelize.define('Staff', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  membership_plan_id: DataTypes.BIGINT.UNSIGNED,
  user_id: DataTypes.BIGINT.UNSIGNED,
  commission: DataTypes.STRING,
  fix_salary: DataTypes.DECIMAL(8,2),
  image: DataTypes.STRING,
  charges: DataTypes.STRING,
  phone: DataTypes.STRING,
  feature: DataTypes.INTEGER,
  status: DataTypes.TINYINT,
  instagram: DataTypes.STRING,
  facebook: DataTypes.STRING,
  snapchat: DataTypes.STRING,
  youtube: DataTypes.STRING,
  tiktok: DataTypes.STRING,
  about: DataTypes.TEXT,
  sub_title: DataTypes.STRING,
  driver_id: DataTypes.BIGINT.UNSIGNED,
  whatsapp: DataTypes.STRING,
  min_order_value: DataTypes.DECIMAL(10,2),
  expiry_date: DataTypes.DATE,
  affiliate_id: DataTypes.BIGINT.UNSIGNED,
  location: DataTypes.STRING,
  nationality: DataTypes.STRING,
  online: DataTypes.TINYINT,
  get_quote: DataTypes.TINYINT,
  quote_amount: DataTypes.DECIMAL(10,2),
  quote_commission: DataTypes.DECIMAL(10,2),
  show_quote_detail: DataTypes.TINYINT,
  delivered_order: DataTypes.INTEGER,
  sort: DataTypes.INTEGER
}, {
  tableName: 'staff',
  timestamps: false
});

module.exports = Staff;