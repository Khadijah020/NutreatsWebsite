import express from "express";
import { 
  generateDescription, 
  generateCategoryDescription, 
  generateMetadata,
  generateImageAlt,
  generateFAQs,
  analyzeSEO,
  generateJsonLdSchema
} from "../controllers/aiController.js";
import authSeller from "../middlewares/authSeller.js";

const aiRouter = express.Router();

// Generate product description with AI (seller only)
aiRouter.post("/generate-description", authSeller, generateDescription);

// Generate category description with AI (seller only)
aiRouter.post("/generate-category-description", authSeller, generateCategoryDescription);

// Generate SEO metadata with AI (seller only)
aiRouter.post("/generate-metadata", authSeller, generateMetadata);

// Generate image ALT text with AI (seller only)
aiRouter.post("/generate-image-alt", authSeller, generateImageAlt);

// Generate FAQs with AI (seller only)
aiRouter.post("/generate-faqs", authSeller, generateFAQs);

// Analyze SEO score (seller only)
aiRouter.post("/analyze-seo", authSeller, analyzeSEO);

// Generate JSON-LD schema with AI (seller only)
aiRouter.post("/generate-json-ld", authSeller, generateJsonLdSchema);

export default aiRouter;
