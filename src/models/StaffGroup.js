const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const Staff = require('./Staff');

const StaffGroup = sequelize.define('StaffGroup', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'staff_groups',
  timestamps: false
});

// Associations
StaffGroup.associate = (models) => {
  // Many-to-Many: StaffGroup <-> Staff (via staff_group_to_staff)
  StaffGroup.belongsToMany(models.Staff, {
    through: 'staff_group_to_staff',
    foreignKey: 'staff_group_id',
    otherKey: 'staff_id'
  });

  // Many-to-Many: StaffGroup <-> StaffZone (via staff_group_staff_zone)
  StaffGroup.belongsToMany(models.StaffZone, {
    through: 'staff_group_staff_zone',
    foreignKey: 'staff_group_id',
    otherKey: 'staff_zone_id'
  });
};

module.exports = StaffGroup;