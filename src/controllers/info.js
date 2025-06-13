const Setting = require('../models/Setting');
const { Op, fn, col, where, literal } = require('sequelize');

const getInfo = async (req, res) => {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: "Missing slug" });

  // We want: LOWER(REPLACE(`key`, ' ', '-')) = slug
  const info = await Setting.findOne({
    where: where(
      fn('LOWER', fn('REPLACE', col('key'), ' ', '-')),
      slug.toLowerCase()
    )
  });

  if (!info) return res.status(404).json({ error: "Info not found" });

  res.json({
    title: info.key,
    content: info.value,
    updatedAt: info.updated_at
  });
};

module.exports = { getInfo };