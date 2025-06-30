const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const ModelHasRoles = sequelize.define(
  "ModelHasRoles",
  {
    role_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    model_type: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    model_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  },
  {
    tableName: "model_has_roles",
    timestamps: false,
  }
);

module.exports = ModelHasRoles;
