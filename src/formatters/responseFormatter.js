
const urls = require('../config/urls');
const { buildUrl } = require('../utils/urlBuilder');
const path = require('path');
const { getOrCreateWebpImage } = require('../utils/image');

const formatBookingSlots = (slots) => {
  return {
    slots: slots.map((slot) => ({
      id: slot.id,
      name: slot.name,
      time_start: slot.time_start,
      time_end: slot.time_end,
      available: slot.available,
      seatAvailable: slot.seatAvailable,
      staff: slot.staff.map((staff) => ({
        id: staff.id,
        name: staff.name,
        image: buildUrl(urls.staffImages, staff.image),
        sub_title: staff.sub_title,
        phone: staff.phone,
        status: staff.status,
      })),
    })),
  };
};

const formatCategory = async (category) => {
  // Resize category image to 318x192 webp in categories folder
  const originalUrl = buildUrl(urls.categoryImages, category.image);
  const resizeDir = process.env.RESIZE_IMAGE_PATH;
  let imageUrl = originalUrl;

  if (category.image) {
    const categoryFolder = path.join(resizeDir, 'categories');
    const webpFilename = `${path.parse(category.image).name}_318x192.webp`;
    imageUrl = `${urls.baseUrl}/resize-images/categories/${webpFilename}`;
    const processedPath = await getOrCreateWebpImage(originalUrl, categoryFolder, webpFilename, 318, 192);
    if (!processedPath) {
      imageUrl = originalUrl;
    }
  }

  return {
    id: category.id,
    title: category.title,
    meta_title: category.meta_title,
    meta_description: category.meta_description,
    meta_keywords: category.meta_keywords,
    description: category.description,
    image: imageUrl,
    services: category?.services && category.services.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      discount: service.discount,
      duration: service.duration,
      rating: service.rating,
      description: service.description,
      image: service.image,
      slug: service.slug,
    })),
    slug: category.slug,
    href: category.slug,
    subcategories:  category?.subcategories && category.subcategories.map((sub) => ({
      id: sub.id,
      title: sub.title,
      description: sub.description,
      image: sub.image,
      href: sub.slug,
      popular: !!sub.popular
    })),
  };
};


const formatService = async (service) => {
  const resizeDir = process.env.RESIZE_IMAGE_PATH;
  const galleryFolder = path.join(resizeDir, 'services', 'additional');

  // Process gallery images with checks
  const gallery = Array.isArray(service.gallery)
    ? await Promise.all(
        service.gallery.map(async (img) => {
          if (!img || typeof img !== 'string') return null;
          try {
            const webpFilename = `${path.parse(img).name}_1080x1080.webp`;
            const originalUrl = buildUrl(urls.serviceGallery, img);
            const processedPath = await getOrCreateWebpImage(
              originalUrl,
              galleryFolder,
              webpFilename,
              1080,
              1080
            );
            // If processing failed, fallback to original image URL
            if (!processedPath || typeof processedPath !== 'string' || processedPath.endsWith('/default.png')) {
              return buildUrl(urls.serviceGallery, img);
            }
            // Return the public URL for the processed image
            return `${urls.baseUrl}/resize-images/services/additional/${webpFilename}`;
          } catch (err) {
            // On error, fallback to original image URL
            return buildUrl(urls.serviceGallery, img);
          }
        })
      )
    : [];

  return {
    id: service.id,
    name: service.name,
    meta_title: service.meta_title,
    meta_description: service.meta_description,
    meta_keywords: service.meta_keywords,
    quote: service.quote,
    price: service.price,
    discount: service.discount,
    duration: service.duration,
    rating: service.rating,
    description: service.description,
    longDescription: service.longDescription,
    image: buildUrl(urls.serviceImages, service.image),
    gallery,
    faqs: service.faqs,
    reviews: service.reviews,
    staffMembers: service.staffMembers.map((staff) => ({
      id: staff.id,
      name: staff.name,
      specialties: staff.specialties,
      rating: staff.rating,
      charges: staff.charges,
      image: buildUrl(urls.staffImages, staff.image),
    })),
    options: service.options,
    specification: service.specification.map((spec) => ({
      id: spec.id,
      title: spec.title,
      value: spec.value,
    })),
    addOns: service.addOns.map((addon) => ({
      id: addon.id,
      name: addon.name,
      price: addon.price,
      discount: addon.discount,
      duration: addon.duration,
      image: buildUrl(urls.serviceImages, addon.image),
      slug: addon.slug,
      hasOptionsOrQuote: addon.hasOptionsOrQuote,
    })),
    packages: service.packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      discount: pkg.discount,
      duration: pkg.duration,
      image: buildUrl(urls.serviceImages, pkg.image),
      slug: pkg.slug,
    })),
  };
};

const formatServiceCard = async (service) => {
  const originalUrl = buildUrl(urls.serviceImages, service.image);
  const resizeDir = process.env.RESIZE_IMAGE_PATH;
  let imageUrl = originalUrl;

  if (service.image) {
    const serviceFolder = path.join(resizeDir, 'services');
    const webpFilename = `${path.parse(service.image).name}_627x192.webp`;
    imageUrl = `${urls.baseUrl}/resize-images/services/${webpFilename}`;
    const processedPath = await getOrCreateWebpImage(originalUrl, serviceFolder, webpFilename, 627, 192);
    if (!processedPath) {
      imageUrl = originalUrl;
    }
  }

  return {
    id: service.id,
    name: service.name,
    price: service.price,
    discount: service.discount,
    duration: service.duration,
    rating: service.rating,
    description: service.description,
    image: imageUrl,
    imagePath: service.imagePath,
    slug: service.slug,
    hasOptionsOrQuote: service.hasOptionsOrQuote,
  };
};

const formatStaffCard = async (input) => {
  const staff = input && input.staff ? input.staff : input;
  const image = staff.image || '';
  const originalUrl = buildUrl(urls.staffImages, image);
  const resizeDir = process.env.RESIZE_IMAGE_PATH;
  let imageUrl = originalUrl;
  if (image) {
    const staffFolder = path.join(resizeDir, 'staff');
    const webpFilename = `${path.parse(image).name}_318x256.webp`;
    imageUrl = `${urls.baseUrl}/resize-images/staff/${webpFilename}`;
    const processedPath = await getOrCreateWebpImage(originalUrl, staffFolder, webpFilename, 318, 256);
    if (!processedPath) {
      imageUrl = originalUrl;
    }
  }

  let specialties = staff.specialties;
  if (!specialties) {
    specialties = staff.subTitles && staff.subTitles.length > 0
      ? staff.subTitles.map((st) => st.name).slice(0, 6)
      : staff.sub_title
      ? [staff.sub_title]
      : ["Stylist"];
  }

  let avg_review_rating = null;
  if (Array.isArray(staff.reviews) && staff.reviews.length > 0) {
    avg_review_rating = (
      staff.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
      staff.reviews.length
    ).toFixed(1);
    avg_review_rating = Number(avg_review_rating);
  }

  return {
    id: staff.id,
    name: staff.User ? staff.User.name : "",
    rating: avg_review_rating,
    specialties,
    image: imageUrl,
    charges: staff.charges,
  };
};

module.exports = { formatBookingSlots, formatCategory, formatService, formatServiceCard, formatStaffCard };
