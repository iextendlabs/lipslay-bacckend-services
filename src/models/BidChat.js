const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const BidChat = sequelize.define(
  "BidChat",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    sender_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    bid_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    file: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    location: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "bid_chats",
    timestamps: false,
    underscored: true,
  }
);

module.exports = BidChat;
