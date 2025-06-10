const { Service, ServiceCategory, Faq, Review, Staff, User, ServiceImage } = require('../models');
const striptags = require('striptags');

const getServiceBySlug = async (req, res) => {
  try {
    const slug = req.query.query;
    if (!slug || slug.trim() === '') {
      return res.status(400).json({ error: 'Missing or empty service slug.' });
    }

    // Fetch service with category
    const service = await Service.findOne({
      where: { slug, status: 1 },
      include: [
        { model: ServiceCategory, attributes: ['title', 'slug'] }
      ]
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // Fetch FAQs for this service
    const faqs = await Faq.findAll({
      where: { service_id: service.id, status: 1 },
      attributes: ['question', 'answer'],
      limit: 5
    });

    // Fetch related services (same category, exclude current)
    const relatedServices = await Service.findAll({
      where: {
        category_id: service.category_id,
        status: 1,
        id: { $ne: service.id }
      },
      attributes: ['name', 'price', 'image', 'slug'],
      limit: 3
    });

    // Fetch staff members (mocked, adjust as per your DB)
    const staffMembers = await Staff.findAll({
      where: { status: 1 },
      include: [{
        model: User,
        attributes: ['name']
      }],
      attributes: ['image', 'about', 'sub_title']
    });

    // Fetch reviews for this service
    const reviews = await Review.findAll({
      where: { service_id: service.id },
      attributes: ['user_name', 'rating', 'created_at', 'content', 'video']
    });

    // Fetch gallery images
    const images = await ServiceImage.findAll({
      where: { service_id: service.id },
      attributes: ['image']
    });
    const gallery = images.map(img => `https://test.lipslay.com/images/services/${img.image}`);

    const features = service.features
      ? service.features.split('|')
      : [
          "Consultation with expert stylist",
          "Shampoo and conditioning",
          "Precision haircut",
          "Blow dry and styling",
          "Finishing products"
        ];

    // Calculate average rating
    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

    // Utility to trim text to a max number of words
    function trimWords(text, maxWords = 100) {
      if (!text) return "";
      const words = text.split(/\s+/);
      return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : text;
    }

    res.json({
      name: service.name,
      price: service.price,
      duration: service.duration,
      rating: avgRating ? Number(avgRating) : null,
      description: trimWords(striptags(service.description), 100),
      longDescription: trimWords(service.long_description, 100),
      image: service.image ? `https://test.lipslay.com/service-images/${service.image}` : null,
      gallery,
      features,
      faqs: faqs.map(f => ({
        question: trimWords(f.question, 100),
        answer: trimWords(f.answer, 100)
      })),
      relatedServices: relatedServices.map(rs => ({
        name: rs.name,
        price: rs.price,
        image: rs.image ? `https://test.lipslay.com/service-images/${rs.image}` : null,
        slug: rs.slug
      })),
      staffMembers: staffMembers.map(staff => ({
        name: staff.User ? staff.User.name : null,
        role: staff.sub_title || "Stylist",
        experience: "5+ years",
        rating: 4.7,
        specialties: ["Cuts", "Color"],
        image: staff.image ? `https://test.lipslay.com/images/staff/${staff.image}` : null
      })),
      reviews: reviews.map(r => ({
        name: r.user_name,
        rating: r.rating,
        date: r.created_at ? r.created_at.toISOString().split('T')[0] : null,
        comment: trimWords(r.content, 100),
        image: r.video ? `https://test.lipslay.com/images/users/${r.video}` : null
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getServiceBySlug };