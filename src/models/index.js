const ServiceCategory = require('./ServiceCategory');
const Service = require('./Service');
const Staff = require('./Staff');
const Faq = require('./Faq');
const User = require('./User');
const Review = require('./Review');
const Setting = require('./Setting');
const ServiceImage = require('./ServiceImage');
const TimeSlot = require('./TimeSlot');
const StaffZone = require('./StaffZone');
const StaffHoliday = require('./StaffHoliday');
const LongHoliday = require('./LongHoliday');
const Order = require('./Order');
const StaffGroup = require('./StaffGroup');
const StaffGroupStaffZone = require('./StaffGroupStaffZone');
const StaffGroupToStaff = require('./StaffGroupToStaff');
const TimeSlotToStaff = require('./TimeSlotToStaff');
const StaffToServices = require('./StaffToServices');
const ServiceToCategory = require('./ServiceToCategory');
const Information = require('./Information');
const Coupon = require('./Coupon');
const CouponHistory = require('./CouponHistory');
const OrderTotal = require('./OrderTotal');
const OrderService = require('./OrderService');
const Affiliate = require('./Affiliate');


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

// Many-to-many
TimeSlot.belongsToMany(Staff, {
  through: TimeSlotToStaff,
  foreignKey: 'time_slot_id',
  otherKey: 'staff_id'
});
Staff.belongsToMany(TimeSlot, {
  through: TimeSlotToStaff,
  foreignKey: 'staff_id',
  otherKey: 'time_slot_id'
});

StaffZone.belongsToMany(StaffGroup, {
  through: StaffGroupStaffZone,
  foreignKey: 'staff_zone_id',
  otherKey: 'staff_group_id'
});
StaffGroup.belongsToMany(StaffZone, {
  through: StaffGroupStaffZone,
  foreignKey: 'staff_group_id',
  otherKey: 'staff_zone_id'
});

StaffGroup.belongsToMany(Staff, {
  through: StaffGroupToStaff,
  foreignKey: 'staff_group_id',
  otherKey: 'staff_id'
});
Staff.belongsToMany(StaffGroup, {
  through: StaffGroupToStaff,
  foreignKey: 'staff_id',
  otherKey: 'staff_group_id'
});

ServiceCategory.belongsToMany(Staff, {
  through: 'staff_to_categories',
  foreignKey: 'category_id',
  otherKey: 'staff_id'
});
Staff.belongsToMany(ServiceCategory, {
  through: 'staff_to_categories',
  foreignKey: 'staff_id',
  otherKey: 'category_id'
});

Service.belongsToMany(Staff, {
  through: StaffToServices,
  foreignKey: 'service_id',
  otherKey: 'staff_id'
});
Staff.belongsToMany(Service, {
  through: StaffToServices,
  foreignKey: 'staff_id',
  otherKey: 'service_id'
});
Service.belongsToMany(ServiceCategory, {
  through: ServiceToCategory,
  foreignKey: 'service_id',
  otherKey: 'category_id'
});
ServiceCategory.belongsToMany(Service, {
  through: ServiceToCategory,
  foreignKey: 'category_id',
  otherKey: 'service_id'
});

module.exports = {
  ServiceCategory,
  Service,
  Staff,
  Faq,
  User,
  Review,
  Setting,
  ServiceImage,
  TimeSlot,
  StaffZone,
  StaffHoliday,
  LongHoliday,
  Order,
  StaffGroup,
  StaffGroupStaffZone,
  StaffGroupToStaff,
  TimeSlotToStaff,
  ServiceToCategory,
  Information,
  Coupon,
  CouponHistory,
  OrderTotal,
  OrderService,
  Affiliate
};