const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const StaffImage = sequelize.define('StaffImage', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  staff_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'staff_images',
  timestamps: false,
});

module.exports = StaffImage;
