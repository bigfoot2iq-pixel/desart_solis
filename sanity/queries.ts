import { defineQuery } from "next-sanity";

export const HOME_QUERY = defineQuery(`{
  "settings": *[_type == "siteSettings" && _id == "siteSettings"][0]{
    whatsappNumber,
    phoneDisplay,
    instagram,
    facebook,
    website,
    freeShippingFrom,
    announcement,
    "cities": cities[]{_key, city, fee}
  },
  "products": *[_type == "product" && availability != "hidden" && defined(slug.current)] | order(sortOrder asc, name asc){
    _id,
    name,
    "slug": slug.current,
    category,
    tagline,
    description,
    size,
    price,
    notes,
    availability,
    "image": image{
      alt,
      "url": asset->url,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  },
  "packs": *[
    _type == "pack" && status == "active"
    && count(products) > 1
    && count(products[@->availability == "available"]) == count(products)
  ] | order(sortOrder asc){
    _id,
    name,
    description,
    badge,
    discountPercent,
    "items": products[]->slug.current
  },
  "reviews": *[_type == "review" && defined(product)] | order(submittedAt desc, _createdAt desc)[0...300]{
    _id,
    author,
    city,
    "date": submittedAt,
    rating,
    title,
    body,
    "product": product->slug.current,
    "verified": verification == "verified",
    reply,
    "helpful": coalesce(helpfulCount, 0),
    "media": media[defined(asset)]{
      _key,
      _type,
      "url": asset->url,
      "mimeType": asset->mimeType,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  },
  "faqs": *[_type == "faq"] | order(sortOrder asc){_id, question, answer}
}`);

export const PRODUCT_ID_BY_SLUG_QUERY = defineQuery(
  `*[_type == "product" && slug.current == $slug && availability != "hidden"][0]._id`,
);

export const REVIEW_EXISTS_QUERY = defineQuery(`count(*[_type == "review" && _id == $id]) > 0`);
