const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const Quote = sequelize.define(
  "Quote",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    service_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    service_name: DataTypes.STRING,
    detail: DataTypes.TEXT,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    status: DataTypes.STRING,
    phone: DataTypes.STRING,
    whatsapp: DataTypes.STRING,
    bid_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    sourcing_quantity: DataTypes.INTEGER,
    location: DataTypes.STRING,
    affiliate_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    zone: DataTypes.STRING,
    source: DataTypes.STRING,
  },
  {
    tableName: "quotes",
    timestamps: false,
  }
);

module.exports = Quote;
