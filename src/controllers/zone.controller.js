const { StaffZone, Country } = require("../models");

exports.listZones = async (req, res) => {
  try {
    const zones = await StaffZone.findAll({
      attributes: ["id", "name", "country_id"],
      order: [["name", "ASC"]],
    });

    const countries = await Country.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    res.json({ zones, countries });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch zones", details: err.message });
  }
};