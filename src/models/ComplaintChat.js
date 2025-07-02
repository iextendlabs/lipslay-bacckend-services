const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const ComplaintChat = sequelize.define(
  "ComplaintChat",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    text: { type: DataTypes.TEXT, allowNull: false },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    complaint_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  },
  {
    tableName: "complaint_chats",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ComplaintChat;
