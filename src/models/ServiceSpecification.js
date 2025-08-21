const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const ServiceSpecification = sequelize.define(
  "ServiceSpecification",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    service_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    tableName: "service_specifications",
    timestamps: false,
  }
);

module.exports = ServiceSpecification;
