const ServiceCategory = require('./ServiceCategory');
const Service = require('./Service');
const Staff = require('./Staff');
const Faq = require('./Faq');
const User = require('./User');
const Review = require('./Review');
const Setting = require('./Setting');
const ServiceImage = require('./ServiceImage');
// Associations
ServiceCategory.hasMany(Service, { foreignKey: 'category_id' });
Service.belongsTo(ServiceCategory, { foreignKey: 'category_id' });

ServiceCategory.hasMany(Faq, { foreignKey: 'category_id' });
Faq.belongsTo(ServiceCategory, { foreignKey: 'category_id' });

Service.hasMany(Faq, { foreignKey: 'service_id' });
Faq.belongsTo(Service, { foreignKey: 'service_id' });

Staff.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
User.hasOne(Staff, { foreignKey: 'user_id' });

Review.belongsTo(User, { foreignKey: 'staff_id', targetKey: 'id' }); // staff_id references users.id
Review.belongsTo(Service, { foreignKey: 'service_id', targetKey: 'id' });

ServiceCategory.hasMany(ServiceCategory, { as: 'childCategories', foreignKey: 'parent_id' });
ServiceCategory.belongsTo(ServiceCategory, { as: 'parentCategory', foreignKey: 'parent_id' });


Service.hasMany(ServiceImage, { foreignKey: 'service_id' });
ServiceImage.belongsTo(Service, { foreignKey: 'service_id' });

module.exports = {
  ServiceCategory,
  Service,
  Staff,
  Faq,
  User,
  Review,
  Setting,
  ServiceImage
};