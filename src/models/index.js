const ServiceCategory = require('./ServiceCategory');
const Service = require('./Service');
const Staff = require('./Staff');
const Faq = require('./Faq');
const User = require('./User');

// Associations
ServiceCategory.hasMany(Service, { foreignKey: 'category_id' });
Service.belongsTo(ServiceCategory, { foreignKey: 'category_id' });

ServiceCategory.hasMany(Faq, { foreignKey: 'category_id' });
Faq.belongsTo(ServiceCategory, { foreignKey: 'category_id' });

Service.hasMany(Faq, { foreignKey: 'service_id' });
Faq.belongsTo(Service, { foreignKey: 'service_id' });

Staff.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Staff, { foreignKey: 'user_id' });

module.exports = {
  ServiceCategory,
  Service,
  Staff,
  Faq,
  User
};