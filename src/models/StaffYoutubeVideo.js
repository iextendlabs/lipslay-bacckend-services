const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const StaffYoutubeVideo = sequelize.define('StaffYoutubeVideo', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  staff_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  youtube_video: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'staff_youtube_videos',
  timestamps: false,
});

module.exports = StaffYoutubeVideo;
