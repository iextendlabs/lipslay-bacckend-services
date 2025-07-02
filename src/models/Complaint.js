const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const Complaint = sequelize.define(
  "Complaint",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  },
  {
    tableName: "complaints",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Complaint;
