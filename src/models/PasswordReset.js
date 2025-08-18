const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const PasswordReset = sequelize.define(
  "PasswordReset",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "password_resets",
    timestamps: false,
  }
);

module.exports = PasswordReset;