const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const { sendPushNotification } = require('../utils/pushNotification');

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  email_verified_at: DataTypes.DATE,
  password: DataTypes.STRING,
  remember_token: DataTypes.STRING,
  device_token: DataTypes.STRING,
  last_notification_id: DataTypes.STRING,
  customer_source: DataTypes.STRING,
  status: DataTypes.STRING,
  affiliate_program: DataTypes.STRING,
  freelancer_program: DataTypes.STRING,
  last_login_time: DataTypes.DATE,
  login_source: DataTypes.STRING,
  number: DataTypes.STRING,
  whatsapp: DataTypes.STRING,
  gender: DataTypes.STRING
}, {
  tableName: 'users',
  timestamps: false
});

User.prototype.notifyOnMobile = async function(title, body, orderId = null, type = null) {
    if (!this.device_token) return 'No device token provided.';
    // Device type check (if needed)
    if (!this.device_type || this.device_type === type) {
        return await sendPushNotification({
            deviceToken: this.device_token,
            title,
            body,
            orderId,
            type,
            deviceType: this.device_type
        });
    }
    return 'Device type does not match.';
};

module.exports = User;