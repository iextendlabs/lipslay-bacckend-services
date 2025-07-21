const Information = require('../models/Information');
const { Op } = require('sequelize');

const getInfo = async (req, res) => {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: "Missing slug" });

  // Find information by slug and status enabled
  const info = await Information.findOne({
    where: {
      slug: slug.toLowerCase(),
      status: 1
    }
  });

  if (!info) return res.status(404).json({ error: "Info not found" });

  res.json({
    title: info.name,
    content: info.description,
    updatedAt: info.updated_at
  });
};

module.exports = { getInfo };