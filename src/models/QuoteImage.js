const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");
const Quote = require("./Quote");

const QuoteImage = sequelize.define(
  "QuoteImage",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    quote_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "quote_images",
    timestamps: false,
  }
);

// Relation: Each image belongs to a quote
QuoteImage.belongsTo(Quote, { foreignKey: "quote_id" });
Quote.hasMany(QuoteImage, { foreignKey: "quote_id" });

module.exports = QuoteImage;
