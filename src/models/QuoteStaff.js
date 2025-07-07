const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const QuoteStaff = sequelize.define(
  "QuoteStaff",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    quote_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    staff_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quote_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    quote_commission: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    tableName: "quote_staff",
    timestamps: false,
  }
);

module.exports = QuoteStaff;
