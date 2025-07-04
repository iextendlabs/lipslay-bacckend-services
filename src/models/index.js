const ServiceCategory = require("./ServiceCategory");
const Service = require("./Service");
const Staff = require("./Staff");
const Faq = require("./Faq");
const User = require("./User");
const Review = require("./Review");
const Setting = require("./Setting");
const ServiceImage = require("./ServiceImage");
const TimeSlot = require("./TimeSlot");
const StaffZone = require("./StaffZone");
const StaffHoliday = require("./StaffHoliday");
const LongHoliday = require("./LongHoliday");
const Order = require("./Order");
const TimeSlotToStaff = require("./TimeSlotToStaff");
const StaffToServices = require("./StaffToServices");
const ServiceToCategory = require("./ServiceToCategory");
const StaffToCategories = require("./StaffToCategories");
const Information = require("./Information");
const Coupon = require("./Coupon");
const CouponHistory = require("./CouponHistory");
const OrderTotal = require("./OrderTotal");
const OrderService = require("./OrderService");
const Affiliate = require("./Affiliate");
const ServiceOption = require("./ServiceOption");
const StaffToZone = require("./StaffToZone");
const StaffGeneralHoliday = require("./StaffGeneralHoliday");
const Holiday = require("./Holiday");
const ModelHasRoles = require("./ModelHasRoles");
const UserAffiliate = require("./UserAffiliate"); // Add this line
const CustomerProfile = require("./CustomerProfile");
const Complaint = require("./Complaint");
const ComplaintChat = require("./ComplaintChat");
const SubTitle = require("./SubTitle");
const StaffSubTitle = require("./StaffSubTitle");
const StaffDriver = require("./StaffDriver");

ServiceCategory.hasMany(Faq, { foreignKey: "category_id" });
Faq.belongsTo(ServiceCategory, { foreignKey: "category_id" });

Service.hasMany(Faq, { foreignKey: "service_id" });
Faq.belongsTo(Service, { foreignKey: "service_id" });

Staff.belongsTo(User, { foreignKey: "user_id", targetKey: "id" });
User.hasOne(Staff, { foreignKey: "user_id" });

// Add missing association for reviews
Staff.hasMany(Review, {
  as: "reviews",
  foreignKey: "staff_id",
  sourceKey: "user_id",
});
Review.belongsTo(Staff, { foreignKey: "staff_id", targetKey: "user_id" });

Review.belongsTo(User, { foreignKey: "staff_id", targetKey: "id" }); // staff_id references users.id
Review.belongsTo(Service, { foreignKey: "service_id", targetKey: "id" });

ServiceCategory.hasMany(ServiceCategory, {
  as: "childCategories",
  foreignKey: "parent_id",
});
ServiceCategory.belongsTo(ServiceCategory, {
  as: "parentCategory",
  foreignKey: "parent_id",
});

Service.hasMany(ServiceImage, { foreignKey: "service_id" });
ServiceImage.belongsTo(Service, { foreignKey: "service_id" });

// Many-to-many
TimeSlot.belongsToMany(Staff, {
  through: TimeSlotToStaff,
  foreignKey: "time_slot_id",
  otherKey: "staff_id",
  sourceKey: "id",
  targetKey: "user_id",
});
Staff.belongsToMany(TimeSlot, {
  through: TimeSlotToStaff,
  foreignKey: "staff_id",
  otherKey: "time_slot_id",
  sourceKey: "user_id",
  targetKey: "id",
});

// In ServiceCategory model
ServiceCategory.belongsToMany(Staff, {
  through: StaffToCategories,
  foreignKey: "category_id",
  otherKey: "staff_id",
  sourceKey: "id",
  targetKey: "user_id",
});

// In Staff model
Staff.belongsToMany(ServiceCategory, {
  through: StaffToCategories,
  foreignKey: "staff_id",
  otherKey: "category_id",
  sourceKey: "user_id",
  targetKey: "id",
});

Service.belongsToMany(Staff, {
  through: StaffToServices,
  foreignKey: "service_id",
  otherKey: "staff_id",
  sourceKey: "id",
  targetKey: "user_id",
});

Staff.belongsToMany(Service, {
  through: StaffToServices,
  foreignKey: "staff_id",
  otherKey: "service_id",
  sourceKey: "user_id",
  targetKey: "id",
});

Service.belongsToMany(ServiceCategory, {
  through: ServiceToCategory,
  foreignKey: "service_id",
  otherKey: "category_id",
});
ServiceCategory.belongsToMany(Service, {
  through: ServiceToCategory,
  foreignKey: "category_id",
  otherKey: "service_id",
});

StaffZone.belongsToMany(Staff, {
  through: StaffToZone,
  foreignKey: "zone_id",
  otherKey: "user_id",
  sourceKey: "id",
  targetKey: "user_id",
});
Staff.belongsToMany(StaffZone, {
  through: StaffToZone,
  foreignKey: "user_id",
  otherKey: "zone_id",
  sourceKey: "user_id",
  targetKey: "id",
});

// Add associations for UserAffiliate
UserAffiliate.belongsTo(User, { foreignKey: "user_id" });
User.hasOne(UserAffiliate, { foreignKey: "user_id" });

UserAffiliate.belongsTo(Affiliate, { foreignKey: "affiliate_id" });
Affiliate.hasMany(UserAffiliate, { foreignKey: "affiliate_id" });

// Set up User <-> CustomerProfile association
User.hasOne(CustomerProfile, { foreignKey: "user_id", as: "customerProfile" });
CustomerProfile.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Complaint relations
Complaint.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Complaint, { foreignKey: "user_id", as: "complaints" });

Complaint.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Order.hasMany(Complaint, { foreignKey: "order_id", as: "complaints" });

// ComplaintChat relations
ComplaintChat.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(ComplaintChat, { foreignKey: "user_id", as: "complaintChats" });

ComplaintChat.belongsTo(Complaint, {
  foreignKey: "complaint_id",
  as: "complaint",
});
Complaint.hasMany(ComplaintChat, { foreignKey: "complaint_id", as: "chats" });

Staff.belongsToMany(SubTitle, {
  through: StaffSubTitle,
  foreignKey: "staff_id",
  otherKey: "sub_title_id",
  sourceKey: "user_id",
  targetKey: "id",
  as: "subTitles",
});
SubTitle.belongsToMany(Staff, {
  through: StaffSubTitle,
  foreignKey: "sub_title_id",
  otherKey: "staff_id",
  sourceKey: "id",
  targetKey: "user_id",
  as: "staffs",
});

// Order <-> OrderService association
Order.hasMany(OrderService, { foreignKey: "order_id", as: "order_services" });
OrderService.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// OrderService <-> Service association
OrderService.belongsTo(Service, { foreignKey: "service_id", as: "service" });
Service.hasMany(OrderService, {
  foreignKey: "service_id",
  as: "order_services",
});

Coupon.belongsToMany(ServiceCategory, {
  through: "coupon_to_category",
  foreignKey: "coupon_id",
  otherKey: "category_id",
  timestamps: false,
});
ServiceCategory.belongsToMany(Coupon, {
  through: "coupon_to_category",
  foreignKey: "category_id",
  otherKey: "coupon_id",
  timestamps: false,
});

Service.belongsToMany(Coupon, {
  through: "coupon_to_service",
  foreignKey: "service_id",
  otherKey: "coupon_id",
  timestamps: false,
});
Coupon.belongsToMany(Service, {
  through: "coupon_to_service",
  foreignKey: "coupon_id",
  otherKey: "service_id",
  timestamps: false,
});

Coupon.belongsToMany(User, {
  through: "customer_coupons",
  foreignKey: "coupon_id",
  otherKey: "customer_id",
  timestamps: false,
});
User.belongsToMany(Coupon, {
  through: "customer_coupons",
  foreignKey: "customer_id",
  otherKey: "coupon_id",
  timestamps: false,
});

Order.hasMany(CouponHistory, { foreignKey: "order_id" });
CouponHistory.belongsTo(Order, { foreignKey: "order_id" });

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
  TimeSlotToStaff,
  ServiceToCategory,
  Information,
  Coupon,
  CouponHistory,
  OrderTotal,
  OrderService,
  Affiliate,
  ServiceOption,
  StaffGeneralHoliday,
  Holiday,
  ModelHasRoles,
  UserAffiliate, // Add this to the exports
  CustomerProfile,
  Complaint,
  ComplaintChat,
  SubTitle,
  StaffSubTitle,
  StaffDriver
};
