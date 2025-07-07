const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const Bid = sequelize.define(
  "Bid",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quote_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bid_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "bids",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Bid;
