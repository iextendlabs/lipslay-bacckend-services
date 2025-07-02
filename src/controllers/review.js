const Review = require("../models/Review");
const ReviewImage = require("../models/ReviewImage");

const addReview = async (req, res) => {
  try {
    const {
      staff_id,
      service_id,
      content,
      rating,
      user_name,
      order_id
    } = req.body;

    // Required fields
    if (!user_name || !content || !rating) {
      return res.status(400).json({ message: "user_name, content, and rating are required" });
    }

    // Handle uploaded files
    let video = null;
    if (req.files && req.files.video && req.files.video[0]) {
      video = req.files.video[0].filename;
    }

    const review = await Review.create({
      staff_id: staff_id || null,
      service_id: service_id || null,
      content,
      rating,
      user_name,
      order_id: order_id || null,
      video: video,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Handle images
    if (req.files && req.files.images && req.files.images.length > 0) {
      const reviewImages = req.files.images.map((img) => ({
        review_id: review.id,
        image: img.filename,
        created_at: new Date(),
        updated_at: new Date(),
      }));
      await ReviewImage.bulkCreate(reviewImages);
    }

    // Fetch review with images
    const reviewWithImages = await Review.findByPk(review.id, {
      include: [{ model: ReviewImage, as: "images" }],
    });

    res.json({
      message: "Review added successfully",
      review: reviewWithImages,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add review", error: error.message });
  }
};

module.exports = { addReview };
