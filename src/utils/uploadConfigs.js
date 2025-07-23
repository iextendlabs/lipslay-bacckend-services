const createUpload = require("../utils/upload");

const reviewUpload = createUpload({
  getPath: (file) => {
    if (file.fieldname === "images") {
      return process.env.REVIEW_IMAGE_UPLOAD_PATH || "src/images/review-images";
    }
    if (file.fieldname === "video") {
      return process.env.REVIEW_VIDEO_UPLOAD_PATH || "src/images/review-videos";
    }
    return "src/images/review-images";
  },
  defaultPath: "src/images/review-images",
});

const quoteUpload = createUpload({
  getPath: (file) => {
    if (file.fieldname === "images") {
      return process.env.QUOTE_IMAGE_UPLOAD_PATH || "src/images/quote-images";
    }
    return "src/images/quote-images";
  },
  defaultPath: "src/images/quote-images",
});

const chatUpload = createUpload({
  getPath: () =>
    process.env.QUOTE_BID_IMAGE_UPLOAD_PATH ||
    "src/images/quote-images/bid-chat-files",
  defaultPath: "src/images/quote-images/bid-chat-files",
});

module.exports = { reviewUpload, quoteUpload, chatUpload };
