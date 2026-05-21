import type { PimProduct } from "./schemas.js";

export const sampleRugProduct: PimProduct = {
  pim_product_id: "pim-rug-atlas-sand",
  family: "rug",
  sku: "RUG-ATLAS-170X240-SAND",
  status: "approved",
  attributes: {
    material: "wool",
    size: "170x240 cm",
    color: "sand",
    shape: "rectangle",
    pile_height_mm: 12,
    care_instruction: "Vacuum regularly and spot clean with mild detergent.",
    suitable_rooms: ["living_room", "bedroom"],
    style: "modern organic",
    origin_country: "IN"
  }
};
