
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

const formatCategory = (category) => {
  return {
    id: category.id,
    title: category.title,
    description: category.description,
    image: buildUrl(urls.categoryImages, category.image),
    services: category?.services && category.services.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      discount: service.discount,
      duration: service.duration,
      rating: service.rating,
      description: service.description,
      image: buildUrl(urls.serviceImages, service.image),
      slug: service.slug,
    })),
    slug: category.slug,
    href: category.slug,
    subcategories:  category?.subcategories && category.subcategories.map((sub) => ({
      id: sub.id,
      title: sub.title,
      description: sub.description,
      image: buildUrl(urls.categoryImages, sub.image),
      href: sub.slug,
      popular: !!sub.popular
    })),
  };
};


const formatService = (service) => {
  return {
    id: service.id,
    name: service.name,
    quote: service.quote,
    price: service.price,
    discount: service.discount,
    duration: service.duration,
    rating: service.rating,
    description: service.description,
    longDescription: service.longDescription,
    image: buildUrl(urls.serviceImages, service.image),
    gallery: service.gallery.map((img) => buildUrl(urls.serviceGallery, img)),
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
  const serviceFolder = path.join(resizeDir, 'services');
  const webpFilename = `${path.parse(service.image).name}_627x192.webp`;
  let imageUrl = `${urls.baseUrl}/resize-images/services/${webpFilename}`;
  const processedPath = await getOrCreateWebpImage(originalUrl, serviceFolder, webpFilename, 627, 192);
  if (!processedPath) {
    imageUrl = originalUrl;
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
    slug: service.slug,
    hasOptionsOrQuote: service.hasOptionsOrQuote,
  };
};

module.exports = { formatBookingSlots, formatCategory, formatService, formatServiceCard };
