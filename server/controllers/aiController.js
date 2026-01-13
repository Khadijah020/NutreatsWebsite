import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate product description using Gemini AI
const generateDescription = async (req, res) => {
  try {
    const { productName, category, weights } = req.body;

    if (!productName) {
      return res.json({
        success: false,
        message: "Product name is required",
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return res.json({
        success: false,
        message: "Gemini API key is not configured. Please add your API key to the .env file.",
      });
    }

    // Build prompt with available information
    let prompt = `You are an expert SEO copywriter for an e-commerce website selling premium masalas, lentils, nuts, dry fruits, and healthy snacks.

Generate a keyword-rich, professional product description that will rank well in search engines.

Product Name: ${productName}`;

    if (category) {
      prompt += `\nCategory: ${category}`;
    }

    if (weights && weights.length > 0) {
      const weightsList = weights.map(w => w.weight).join(", ");
      prompt += `\nAvailable Sizes: ${weightsList}`;
    }

    prompt += `\n\nRequirements:
- Write 3-4 sentences in a professional, appetizing tone
- Include relevant keywords naturally: "premium", "fresh", "high-quality", "natural" (if applicable), "healthy", "nutritious"
- Mention specific health benefits and nutritional value
- Highlight quality, freshness, and sourcing
- Include the product name and category keywords naturally
- Use HTML formatting: <p> tags for paragraphs, <strong> for emphasis on key benefits
- Make it SEO-friendly but natural and engaging for customers
- Focus on what makes this product stand out

Generate only the description, no additional text or explanations.`;

    // Get Gemini model (gemini-2.5-flash - latest model, works with free tier)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Generate content with retry logic for overloaded service
    let retries = 3;
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const description = response.text();

        return res.json({
          success: true,
          description: description.trim(),
        });
      } catch (error) {
        lastError = error;
        
        // If service is overloaded (503) or rate limited (429), wait and retry
        if ((error.message.includes('503') || error.message.includes('429')) && i < retries - 1) {
          console.log(`Retry ${i + 1}/${retries - 1} after ${1000 * (i + 1)}ms...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Wait 1s, 2s, 3s
          continue;
        }
        
        // For other errors or final retry, throw
        throw error;
      }
    }
    
    // If all retries failed
    throw lastError;
  } catch (error) {
    console.error("Error generating description:", error);
    res.json({
      success: false,
      message: error.message || "Failed to generate description",
    });
  }
};

// Generate category description using Gemini AI
const generateCategoryDescription = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return res.json({
        success: false,
        message: "Gemini API key is not configured. Please add your API key to the .env file.",
      });
    }

    // Build prompt for category description
    let prompt = `You are an expert SEO copywriter for an e-commerce website selling premium nuts, dry fruits, and healthy snacks.

Generate a keyword-rich, professional category description that will rank well in search engines and attract customers.

Category Name: ${categoryName}

Requirements:
- Write 1-2 compelling but very short and concise sentences in a professional tone
- Include relevant keywords naturally: "premium", "fresh", "high-quality", "organic", "healthy", "nutritious", "handpicked"
- Highlight what makes this category special
- Mention variety, quality, and health benefits
- Include the category name naturally in the description
- Make it SEO-friendly but engaging for customers
- Do NOT use HTML formatting for category descriptions
- Focus on enticing customers to explore this category

Generate only the description, no additional text or explanations. Do not add unnecessary details.`;

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Generate content with retry logic
    let retries = 3;
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const description = response.text();

        return res.json({
          success: true,
          description: description.trim(),
        });
      } catch (error) {
        lastError = error;
        
        // If service is overloaded (503) or rate limited (429), wait and retry
        if ((error.message.includes('503') || error.message.includes('429')) && i < retries - 1) {
          console.log(`Retry ${i + 1}/${retries - 1} after ${1000 * (i + 1)}ms...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error("Error generating category description:", error);
    res.json({
      success: false,
      message: error.message || "Failed to generate description",
    });
  }
};

// Generate SEO metadata (title and description) for products
const generateMetadata = async (req, res) => {
  try {
    const { productName, category, description } = req.body;

    if (!productName) {
      return res.json({
        success: false,
        message: "Product name is required",
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return res.json({
        success: false,
        message: "Gemini API key is not configured.",
      });
    }

    // Build prompt for metadata generation
    let prompt = `You are an expert SEO specialist. Generate SEO metadata for an e-commerce product.

Product Name: ${productName}`;

    if (category) {
      prompt += `\nCategory: ${category}`;
    }

    if (description) {
      // Remove HTML tags for context
      const plainDesc = description.replace(/<[^>]*>/g, '').substring(0, 200);
      prompt += `\nProduct Description: ${plainDesc}`;
    }

    prompt += `\n\nGenerate SEO metadata with these exact requirements:

1. META TITLE (max 60 characters):
   - Include product name and 1-2 keywords
   - Make it compelling and clickable
   - Include brand "NuTreats" if space allows
   - Must be under 60 characters total

2. META DESCRIPTION (max 160 characters):
   - Summarize key benefits
   - Include 2-3 relevant keywords naturally
   - Add a call-to-action
   - Make it enticing for search engines and users
   - Must be under 160 characters total

3. META KEYWORDS (5-8 keywords):
   - Generate 5-8 relevant keywords/phrases
   - Include product name, category, and related terms
   - Separate with commas
   - Focus on search terms customers would use

Format your response EXACTLY like this (no extra text):
TITLE: [your meta title here]
DESCRIPTION: [your meta description here]
KEYWORDS: [keyword1, keyword2, keyword3, etc.]

Be concise and stay within character limits!`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Generate content with retry logic
    let retries = 3;
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the response
        const titleMatch = text.match(/TITLE:\s*(.+)/i);
        const descMatch = text.match(/DESCRIPTION:\s*(.+)/i);
        const keywordsMatch = text.match(/KEYWORDS:\s*(.+)/i);

        if (!titleMatch || !descMatch || !keywordsMatch) {
          throw new Error("Failed to parse AI response");
        }

        let metaTitle = titleMatch[1].trim();
        let metaDescription = descMatch[1].trim();
        let metaKeywords = keywordsMatch[1].trim();

        // Enforce character limits (trim if needed)
        if (metaTitle.length > 60) {
          metaTitle = metaTitle.substring(0, 57) + '...';
        }
        if (metaDescription.length > 160) {
          metaDescription = metaDescription.substring(0, 157) + '...';
        }

        return res.json({
          success: true,
          metaTitle,
          metaDescription,
          metaKeywords,
        });
      } catch (error) {
        lastError = error;
        
        if ((error.message.includes('503') || error.message.includes('429')) && i < retries - 1) {
          console.log(`Retry ${i + 1}/${retries - 1} after ${1000 * (i + 1)}ms...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error("Error generating metadata:", error);
    res.json({
      success: false,
      message: error.message || "Failed to generate metadata",
    });
  }
};

// Generate image ALT text
const generateImageAlt = async (req, res) => {
  try {
    const { productName, category, imageIndex } = req.body;

    if (!productName) {
      return res.json({
        success: false,
        message: "Product name is required",
      });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return res.json({
        success: false,
        message: "Gemini API key is not configured.",
      });
    }

    let prompt = `Generate a descriptive, SEO-friendly ALT text for a product image.

Product Name: ${productName}
Category: ${category || 'Food Product'}
Image Number: ${imageIndex + 1 || 1}

Requirements:
- Maximum 125 characters
- Describe what's in the image
- Include product name naturally
- Be specific and descriptive
- SEO-friendly but natural
- No quotes or extra formatting

Generate only the ALT text, nothing else.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    let retries = 3;
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let altText = response.text().trim();

        // Remove quotes if present
        altText = altText.replace(/^["']|["']$/g, '');
        
        // Enforce character limit
        if (altText.length > 125) {
          altText = altText.substring(0, 122) + '...';
        }

        return res.json({
          success: true,
          altText,
        });
      } catch (error) {
        lastError = error;
        
        if ((error.message.includes('503') || error.message.includes('429')) && i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error("Error generating ALT text:", error);
    res.json({
      success: false,
      message: error.message || "Failed to generate ALT text",
    });
  }
};

// Generate FAQs for product
const generateFAQs = async (req, res) => {
  try {
    const { productName, category, description } = req.body;

    if (!productName) {
      return res.json({
        success: false,
        message: "Product name is required",
      });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return res.json({
        success: false,
        message: "Gemini API key is not configured.",
      });
    }

    const plainDesc = description ? description.replace(/<[^>]*>/g, '').substring(0, 200) : '';

    let prompt = `Generate 5 frequently asked questions (FAQs) about this product for an e-commerce website.

Product Name: ${productName}
Category: ${category || 'Food Product'}${plainDesc ? `\nDescription: ${plainDesc}` : ''}

Requirements:
- Generate exactly 5 relevant FAQs
- Questions should be natural, common customer queries
- Answers should be helpful, concise (2-3 sentences)
- Include keywords naturally
- Focus on: ingredients, storage, benefits, usage, packaging
- Be informative and helpful

Format your response EXACTLY like this:
Q1: [question]
A1: [answer]
Q2: [question]
A2: [answer]
Q3: [question]
A3: [answer]
Q4: [question]
A4: [answer]
Q5: [question]
A5: [answer]`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    let retries = 3;
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse FAQs
        const faqs = [];
        for (let j = 1; j <= 5; j++) {
          const qMatch = text.match(new RegExp(`Q${j}:\\s*(.+?)(?=\\n|A${j}:)`, 's'));
          const aMatch = text.match(new RegExp(`A${j}:\\s*(.+?)(?=\\n\\n|Q${j + 1}:|$)`, 's'));
          
          if (qMatch && aMatch) {
            faqs.push({
              question: qMatch[1].trim(),
              answer: aMatch[1].trim(),
            });
          }
        }

        if (faqs.length === 0) {
          throw new Error("Failed to parse FAQs");
        }

        return res.json({
          success: true,
          faqs,
        });
      } catch (error) {
        lastError = error;
        
        if ((error.message.includes('503') || error.message.includes('429')) && i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error("Error generating FAQs:", error);
    res.json({
      success: false,
      message: error.message || "Failed to generate FAQs",
    });
  }
};

// Analyze SEO score
const analyzeSEO = async (req, res) => {
  try {
    const { 
      productName, 
      description, 
      metaTitle, 
      metaDescription, 
      category,
      images 
    } = req.body;

    const analysis = {
      score: 0,
      maxScore: 100,
      issues: [],
      warnings: [],
      suggestions: [],
      passed: [],
    };

    // Remove HTML tags for analysis
    const plainDescription = description ? description.replace(/<[^>]*>/g, '') : '';
    const wordCount = plainDescription.split(/\s+/).filter(word => word.length > 0).length;

    // 1. Product Name (10 points)
    if (productName && productName.length >= 3) {
      analysis.score += 10;
      analysis.passed.push('✓ Product name is present');
    } else {
      analysis.issues.push('✗ Product name is missing or too short');
    }

    // 2. Meta Title (15 points)
    if (metaTitle && metaTitle.length > 0) {
      if (metaTitle.length >= 30 && metaTitle.length <= 60) {
        analysis.score += 15;
        analysis.passed.push(`✓ Meta title length is optimal (${metaTitle.length} chars)`);
      } else if (metaTitle.length < 30) {
        analysis.score += 7;
        analysis.warnings.push(`⚠ Meta title is too short (${metaTitle.length}/30-60 chars)`);
      } else {
        analysis.score += 7;
        analysis.warnings.push(`⚠ Meta title is too long (${metaTitle.length}/60 chars max)`);
      }
      
      // Check if product name is in meta title
      if (productName && metaTitle.toLowerCase().includes(productName.toLowerCase())) {
        analysis.score += 5;
        analysis.passed.push('✓ Product name appears in meta title');
      } else {
        analysis.warnings.push('⚠ Product name should appear in meta title');
      }
    } else {
      analysis.issues.push('✗ Meta title is missing');
    }

    // 3. Meta Description (15 points)
    if (metaDescription && metaDescription.length > 0) {
      if (metaDescription.length >= 120 && metaDescription.length <= 160) {
        analysis.score += 15;
        analysis.passed.push(`✓ Meta description length is optimal (${metaDescription.length} chars)`);
      } else if (metaDescription.length < 120) {
        analysis.score += 7;
        analysis.warnings.push(`⚠ Meta description is too short (${metaDescription.length}/120-160 chars)`);
      } else {
        analysis.score += 7;
        analysis.warnings.push(`⚠ Meta description is too long (${metaDescription.length}/160 chars max)`);
      }
    } else {
      analysis.issues.push('✗ Meta description is missing');
    }

    // 4. Product Description (20 points)
    if (plainDescription && plainDescription.length > 0) {
      if (wordCount >= 50 && wordCount <= 300) {
        analysis.score += 20;
        analysis.passed.push(`✓ Description length is good (${wordCount} words)`);
      } else if (wordCount < 50) {
        analysis.score += 10;
        analysis.warnings.push(`⚠ Description is short (${wordCount} words, aim for 50-300)`);
      } else {
        analysis.score += 15;
        analysis.passed.push(`✓ Description is comprehensive (${wordCount} words)`);
      }
      
      // Check keyword usage
      const lowerDesc = plainDescription.toLowerCase();
      const lowerName = productName.toLowerCase();
      const keywordCount = (lowerDesc.match(new RegExp(lowerName, 'g')) || []).length;
      const keywordDensity = (keywordCount / wordCount) * 100;
      
      if (keywordCount >= 1 && keywordDensity <= 3) {
        analysis.score += 10;
        analysis.passed.push(`✓ Keyword usage is optimal (${keywordCount} times, ${keywordDensity.toFixed(1)}%)`);
      } else if (keywordCount === 0) {
        analysis.warnings.push('⚠ Product name should appear in description');
      } else if (keywordDensity > 3) {
        analysis.warnings.push(`⚠ Keyword density is high (${keywordDensity.toFixed(1)}%, keep under 3%)`);
      }
    } else {
      analysis.issues.push('✗ Product description is missing');
    }

    // 5. Category (5 points)
    if (category && category.length > 0) {
      analysis.score += 5;
      analysis.passed.push('✓ Category is assigned');
    } else {
      analysis.issues.push('✗ Category is missing');
    }

    // 6. Images (10 points)
    if (images && images.length > 0) {
      analysis.score += 10;
      analysis.passed.push(`✓ ${images.length} product image(s) added`);
      
      if (images.length >= 3) {
        analysis.score += 5;
        analysis.passed.push('✓ Multiple images improve engagement');
      } else {
        analysis.suggestions.push('💡 Add more images (3+ recommended)');
      }
    } else {
      analysis.issues.push('✗ No product images');
    }

    // 7. Overall Assessment
    if (analysis.score >= 80) {
      analysis.rating = 'Excellent';
      analysis.ratingColor = 'green';
    } else if (analysis.score >= 60) {
      analysis.rating = 'Good';
      analysis.ratingColor = 'blue';
    } else if (analysis.score >= 40) {
      analysis.rating = 'Needs Improvement';
      analysis.ratingColor = 'orange';
    } else {
      analysis.rating = 'Poor';
      analysis.ratingColor = 'red';
    }

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Error analyzing SEO:", error);
    res.json({
      success: false,
      message: error.message || "Failed to analyze SEO",
    });
  }
};

// Generate JSON-LD Schema using Gemini AI
const generateJsonLdSchema = async (req, res) => {
  try {
    const { productName, category, description, price, offerPrice, weights, faqs } = req.body;

    if (!productName) {
      return res.json({
        success: false,
        message: "Product name is required",
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return res.json({
        success: false,
        message: "Gemini API key is not configured.",
      });
    }

    let prompt = `You are an expert in Schema.org structured data and JSON-LD for SEO.

Generate a comprehensive JSON-LD schema for an e-commerce product that will help with search engine visibility.

Product Information:
Name: ${productName}
Category: ${category || 'General'}
Description: ${description || 'No description provided'}`;

    if (weights && weights.length > 0) {
      prompt += `\nAvailable Weights/Sizes: ${weights.map(w => `${w.weight} - Rs. ${w.offerPrice}`).join(', ')}`;
    } else if (price && offerPrice) {
      prompt += `\nPrice: Rs. ${price}\nOffer Price: Rs. ${offerPrice}`;
    }

    if (faqs && faqs.length > 0) {
      prompt += `\n\nFAQs available: ${faqs.length} questions`;
    }

    prompt += `\n\nRequirements:
1. Generate a Product schema with:
   - @context and @type
   - name, description, sku, brand (NuTreats)
   - offers array with price, priceCurrency (INR), availability (InStock)
   - aggregateRating if appropriate (4.5-5.0 stars range, 10-50 reviews)
   - Include category information

2. If FAQs exist, also generate a separate FAQPage schema

3. Generate a BreadcrumbList schema with:
   - Home → Category → Product

4. Return ONLY valid JSON with all three schemas in this exact format:
{
  "productSchema": { ... },
  "faqSchema": { ... } or null,
  "breadcrumbSchema": { ... }
}

5. Ensure all JSON is valid and properly escaped
6. Use realistic values based on the product type
7. Make it SEO-optimized and search engine friendly

Generate only the JSON object, no markdown formatting, no explanations, no code blocks.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    let retries = 3;
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonText = response.text().trim();

        // Clean up markdown code blocks if present
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Parse and validate JSON
        const schemas = JSON.parse(jsonText);

        return res.json({
          success: true,
          schemas,
        });
      } catch (error) {
        lastError = error;
        
        if ((error.message.includes('503') || error.message.includes('429')) && i < retries - 1) {
          console.log(`Retry ${i + 1}/${retries - 1} after ${1000 * (i + 1)}ms...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error("Error generating JSON-LD schema:", error);
    res.json({
      success: false,
      message: error.message || "Failed to generate JSON-LD schema",
    });
  }
};

export { 
  generateDescription, 
  generateCategoryDescription, 
  generateMetadata,
  generateImageAlt,
  generateFAQs,
  analyzeSEO,
  generateJsonLdSchema
};
