// src/controllers/staff.js
// Controller for staff detail endpoint
const { Staff, Service, ServiceCategory, Review } = require('../models');

/**
 * GET /staff?staff=slug_or_id
 * Returns staff details, related services, categories, description, reviews, etc.
 */
exports.getStaffDetail = async (req, res, next) => {
  try {
    const { staff } = req.query;
    if (!staff) {
      return res.status(400).json({ error: 'Missing staff parameter' });
    }

    // Find staff by slug or id
    let staffObj;
    // try {ds
      staffObj = await Staff.findOne({
        where: isNaN(staff) ? { slug: staff } : { id: staff },
        include: [
          {
            model: Service,
            // Remove 'as' unless you explicitly set it in the association
            through: { attributes: [] },
          },
          {
            model: ServiceCategory,
            // Remove 'as' unless you explicitly set it in the association
            through: { attributes: [] },
          },
          {
            model: Review,
            as: 'reviews',
          },
          {
            model: require('../models').User,
            attributes: ['name'],
          },
        ],
      });
    // } catch (err) {
    //   // If Sequelize throws, treat as not found
    //   return res.status(404).json({ error: 'Staff not found' });
    // }

    if (!staffObj) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Format output (customize as needed)
    const output = {
      id: staffObj.id,
      staff_id: staffObj.id, // add staff_id explicitly
      membership_plan_id: staffObj.membership_plan_id,
      user_id: staffObj.user_id,
      commission: staffObj.commission,
      fix_salary: staffObj.fix_salary,
      image: staffObj.image,
      charges: staffObj.charges,
      phone: staffObj.phone,
      status: staffObj.status,
      instagram: staffObj.instagram,
      facebook: staffObj.facebook,
      snapchat: staffObj.snapchat,
      youtube: staffObj.youtube,
      tiktok: staffObj.tiktok,
      about: staffObj.about,
      sub_title: staffObj.sub_title,
      driver_id: staffObj.driver_id,
      whatsapp: staffObj.whatsapp,
      min_order_value: staffObj.min_order_value,
      expiry_date: staffObj.expiry_date,
      affiliate_id: staffObj.affiliate_id,
      location: staffObj.location,
      nationality: staffObj.nationality,
      online: staffObj.online,
      get_quote: staffObj.get_quote,
      quote_amount: staffObj.quote_amount,
      quote_commission: staffObj.quote_commission,
      show_quote_detail: staffObj.show_quote_detail,
      name: staffObj.User ? staffObj.User.name : null,
      slug: staffObj.slug,
      description: staffObj.description,
      services: staffObj.services || [],
      categories: staffObj.categories || [],
      reviews: staffObj.reviews || [],
    };

    res.json(output);
  } catch (err) {
    // Always return 404 for not found, 400 for missing param, 500 for other errors
    if (err.name && err.name.startsWith('Sequelize')) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
