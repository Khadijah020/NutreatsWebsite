import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { Trash2, Edit2, Upload, ArrowLeft, X, Sparkles, CheckCircle, PlusCircle } from "lucide-react";
import RichTextEditor from "../../components/seller/RichTextEditor.jsx";

const EditProductDetails = () => {
  const { axios, currency } = useAppContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    offerPrice: "",
    image: [],
    category: "",
    inStock: true,
    isFeatured: false,
    weights: [],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    imageAltTexts: [],
  });
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [showAIPreview, setShowAIPreview] = useState(false);
  
  // SEO AI States
  const [generatingMetadata, setGeneratingMetadata] = useState(false);
  const [aiMetadata, setAiMetadata] = useState({ title: "", description: "", keywords: "" });
  const [showMetadataPreview, setShowMetadataPreview] = useState(false);
  const [generatingAltText, setGeneratingAltText] = useState(false);
  const [seoAnalysis, setSeoAnalysis] = useState(null);
  const [analyzingSEO, setAnalyzingSEO] = useState(false);
  const [jsonLdSchema, setJsonLdSchema] = useState(null);
  const [generatingJsonLd, setGeneratingJsonLd] = useState(false);

  // Weight variant state
  const [currentWeight, setCurrentWeight] = useState({
    weight: "",
    price: "",
    offerPrice: "",
  });
  const [editingWeightIndex, setEditingWeightIndex] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState("basic");

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "seo", label: "SEO & Schema" },
    { id: "advanced", label: "Weight Variants" }
  ];

  // Check tab completion status
  const isTabComplete = (tabId) => {
    switch(tabId) {
      case "basic":
        return product.name.trim() && product.description.trim() && product.category && product.image.length > 0;
      case "seo":
        return product.metaTitle?.trim() || product.metaDescription?.trim() || product.imageAltTexts?.some(alt => alt?.trim()) || jsonLdSchema !== null;
      case "advanced":
        return product.weights?.length > 0 || product.isFeatured;
      default:
        return false;
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/list");
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const fetchProduct = async () => {
    try {
      const { data } = await axios.post("/api/product/id", { id });
      if (data.success) {
        const productData = data.product;

        let cleanDescription = "";
        
        if (typeof productData.description === "string") {
          cleanDescription = productData.description;
        } else if (Array.isArray(productData.description)) {
          cleanDescription = productData.description
            .filter(item => item && item.trim() !== "")
            .join("<br>");
        }

        setProduct({
          ...productData,
          description: cleanDescription
        });
        
        setImagePreview(productData.image);
        if (productData.jsonLdSchema) {
          setJsonLdSchema(productData.jsonLdSchema);
        }
      } else {
        toast.error("Failed to load product");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const switchToWeightVariants = () => {
    if (product.price !== "" || product.offerPrice !== "") {
      const confirmed = window.confirm(
        "Switching to weight variants will set base prices to 0. Continue?"
      );
      if (!confirmed) return;
    }

    setProduct((prev) => ({
      ...prev,
      price: "0",
      offerPrice: "0",
    }));
    toast.success("You can now add weight variants");
  };

  const addWeightVariant = () => {
    if (
      !currentWeight.weight ||
      !currentWeight.price ||
      !currentWeight.offerPrice
    ) {
      toast.error("Please fill all weight fields");
      return;
    }

    if (
      (product.price !== "0" || product.offerPrice !== "0") &&
      product.weights.length === 0
    ) {
      const confirmed = window.confirm(
        "Adding weight variants will set base prices to 0. Continue?"
      );
      if (!confirmed) return;

      setProduct((prev) => ({
        ...prev,
        price: "0",
        offerPrice: "0",
      }));
    }

    if (editingWeightIndex !== null) {
      setProduct((prev) => ({
        ...prev,
        weights: prev.weights.map((w, i) =>
          i === editingWeightIndex ? currentWeight : w
        ),
      }));
      setEditingWeightIndex(null);
      toast.success("Weight variant updated");
    } else {
      setProduct((prev) => ({
        ...prev,
        weights: [...(prev.weights || []), currentWeight],
      }));
      toast.success("Weight variant added");
    }

    setCurrentWeight({ weight: "", price: "", offerPrice: "" });
  };

  const startEditingWeight = (index) => {
    setCurrentWeight(product.weights[index]);
    setEditingWeightIndex(index);
  };

  const cancelEditingWeight = () => {
    setCurrentWeight({ weight: "", price: "", offerPrice: "" });
    setEditingWeightIndex(null);
  };

  const removeWeightVariant = (index) => {
    const newWeights = product.weights.filter((_, i) => i !== index);
    setProduct((prev) => ({
      ...prev,
      weights: newWeights,
    }));

    if (editingWeightIndex === index) {
      cancelEditingWeight();
    }

    toast.success("Weight variant removed");
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const { data } = await axios.post(
        "/api/product/upload-images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (data.success) {
        const newImagesCount = data.imageUrls.length;
        const newAltTexts = Array(newImagesCount).fill('');
        
        setProduct((prev) => ({
          ...prev,
          image: [...prev.image, ...data.imageUrls],
          imageAltTexts: [...(prev.imageAltTexts || []), ...newAltTexts],
        }));
        setImagePreview((prev) => [...prev, ...data.imageUrls]);
        toast.success("Images uploaded successfully");
      } else {
        toast.error(data.message || "Failed to upload images");
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setProduct((prev) => ({
      ...prev,
      image: prev.image.filter((_, i) => i !== index),
      imageAltTexts: (prev.imageAltTexts || []).filter((_, i) => i !== index),
    }));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image and its ALT text removed");
  };

  const generateAIDescription = async () => {
    if (!product.name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }

    try {
      setGeneratingAI(true);
      const { data } = await axios.post("/api/ai/generate-description", {
        productName: product.name,
        category: product.category || null,
        weights: product.weights && product.weights.length > 0 ? product.weights : null,
      });

      if (data.success) {
        setAiDescription(data.description);
        setShowAIPreview(true);
        toast.success("AI description generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate description");
      }
    } catch (error) {
      console.error("Error generating AI description:", error);
      toast.error(error.response?.data?.message || "Failed to generate description");
    } finally {
      setGeneratingAI(false);
    }
  };

  const approveAIDescription = () => {
    handleInputChange("description", aiDescription);
    setShowAIPreview(false);
    setAiDescription("");
    toast.success("Description approved and updated!");
  };

  const rejectAIDescription = () => {
    setShowAIPreview(false);
    setAiDescription("");
    toast("Description rejected");
  };

  // SEO Metadata AI Functions
  const generateAIMetadata = async () => {
    if (!product.name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }

    setGeneratingMetadata(true);
    try {
      const { data } = await axios.post("/api/ai/generate-metadata", {
        productName: product.name,
        description: product.description || "",
        category: product.category || "",
      });

      if (data.success) {
        setAiMetadata({ title: data.metaTitle, description: data.metaDescription, keywords: data.metaKeywords || '' });
        setShowMetadataPreview(true);
        toast.success("SEO metadata generated!");
      } else {
        toast.error(data.message || "Failed to generate metadata");
      }
    } catch (error) {
      console.error("AI Metadata Error:", error);
      toast.error(error.response?.data?.message || "Failed to generate metadata");
    } finally {
      setGeneratingMetadata(false);
    }
  };

  const approveAIMetadata = () => {
    handleInputChange("metaTitle", aiMetadata.title);
    handleInputChange("metaDescription", aiMetadata.description);
    handleInputChange("metaKeywords", aiMetadata.keywords);
    setShowMetadataPreview(false);
    setAiMetadata({ title: "", description: "", keywords: "" });
    toast.success("SEO metadata approved!");
  };

  const rejectAIMetadata = () => {
    setShowMetadataPreview(false);
    setAiMetadata({ title: "", description: "", keywords: "" });
    toast("Metadata rejected");
  };

  // Image ALT Text AI Functions
  const generateAltTextForImage = async (index) => {
    if (!product.name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }

    setGeneratingAltText(true);
    try {
      const { data } = await axios.post("/api/ai/generate-image-alt", {
        productName: product.name,
        imageIndex: index + 1,
        category: product.category || "",
      });

      if (data.success) {
        const newAltTexts = [...(product.imageAltTexts || [])];
        newAltTexts[index] = data.altText;
        handleInputChange("imageAltTexts", newAltTexts);
        toast.success(`ALT text generated for Image ${index + 1}`);
      } else {
        toast.error(data.message || "Failed to generate ALT text");
      }
    } catch (error) {
      console.error("AI ALT Text Error:", error);
      toast.error(error.response?.data?.message || "Failed to generate ALT text");
    } finally {
      setGeneratingAltText(false);
    }
  };

  const generateAllAltTexts = async () => {
    if (!product.name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }

    const imageCount = imagePreview.length;
    if (imageCount === 0) {
      toast.error("No images to generate ALT text for");
      return;
    }

    setGeneratingAltText(true);
    try {
      const promises = Array.from({ length: imageCount }, (_, index) =>
        axios.post("/api/ai/generate-image-alt", {
          productName: product.name,
          imageIndex: index + 1,
          category: product.category || "",
        })
      );

      const results = await Promise.all(promises);
      const newAltTexts = results.map((res) => res.data.success ? res.data.altText : "");
      handleInputChange("imageAltTexts", newAltTexts);
      toast.success(`Generated ALT text for all ${imageCount} images!`);
    } catch (error) {
      console.error("AI ALT Text Error:", error);
      toast.error("Failed to generate some ALT texts");
    } finally {
      setGeneratingAltText(false);
    }
  };

  // SEO Analysis AI Functions
  const analyzeSEONow = async () => {
    if (!product.name.trim() || !product.description.trim()) {
      toast.error("Please enter product name and description first");
      return;
    }

    setAnalyzingSEO(true);
    try {
      const { data } = await axios.post("/api/ai/analyze-seo", {
        productName: product.name,
        description: product.description,
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        category: product.category || "",
        imageAltTexts: product.imageAltTexts || [],
      });

      if (data.success) {
        setSeoAnalysis(data.analysis);
        toast.success("SEO analysis complete!");
      } else {
        toast.error(data.message || "Failed to analyze SEO");
      }
    } catch (error) {
      console.error("AI SEO Analysis Error:", error);
      toast.error(error.response?.data?.message || "Failed to analyze SEO");
    } finally {
      setAnalyzingSEO(false);
    }
  };

  const generateJsonLdSchema = async () => {
    if (!product.name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }

    try {
      setGeneratingJsonLd(true);
      const { data } = await axios.post("/api/ai/generate-json-ld", {
        productName: product.name,
        category: product.category || null,
        description: product.description || null,
        price: product.price || null,
        offerPrice: product.offerPrice || null,
        weights: product.weights || [],
      });

      if (data.success) {
        setJsonLdSchema(data.schemas);
        toast.success("JSON-LD schema generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate JSON-LD schema");
      }
    } catch (error) {
      console.error("Error generating JSON-LD schema:", error);
      toast.error(error.response?.data?.message || "Failed to generate JSON-LD schema");
    } finally {
      setGeneratingJsonLd(false);
    }
  };

  const handleSave = async () => {
    if (!product.name || !product.category) {
      toast.error("Please fill all required fields");
      return;
    }

    const hasBasePrice = product.price !== "0" && product.offerPrice !== "0";
    const hasWeights = product.weights && product.weights.length > 0;

    if (!hasBasePrice && !hasWeights) {
      toast.error("Please add either base prices or weight variants");
      return;
    }

    if (product.image.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        id,
        name: product.name,
        price: product.price,
        offerPrice: product.offerPrice,
        image: product.image,
        category: product.category,
        inStock: product.inStock,
        isFeatured: product.isFeatured,
        weights: product.weights || [],
        description: product.description || "",
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        metaKeywords: product.metaKeywords || "",
        imageAltTexts: product.imageAltTexts || [],
        jsonLdSchema: jsonLdSchema || null,
      };

      const { data } = await axios.post("/api/product/update", updateData);
      if (data.success) {
        toast.success("Product updated successfully");
        navigate("/seller/product-list");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const hasWeightVariants = product.weights && product.weights.length > 0;
  const hasBasePricing = product.price !== "0" || product.offerPrice !== "0";

  // Render tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case "basic":
        return (
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="font-semibold block mb-2 text-black text-sm md:text-base">
                Product Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                placeholder="Enter product name"
              />
            </div>

            {/* Category */}
            <div>
              <label className="font-semibold block mb-2 text-black text-sm md:text-base">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                value={product.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="font-semibold block mb-2 text-black text-sm md:text-base">
                Product Description
              </label>
              
              {/* AI Generate Button */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={generateAIDescription}
                  disabled={generatingAI || !product.name.trim()}
                  className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-semibold transition-all w-full md:w-auto ${
                    generatingAI || !product.name.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl hover:scale-105"
                  }`}
                >
                  <Sparkles size={18} className={generatingAI ? "animate-spin" : ""} />
                  {generatingAI ? "Generating..." : "Generate with AI"}
                </button>
              </div>

              {/* AI Preview Modal */}
              {showAIPreview && (
                <div className="mb-4 p-4 md:p-5 border-2 border-purple-500 rounded-xl bg-purple-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base md:text-lg font-bold text-purple-700 flex items-center gap-2">
                      <Sparkles size={18} />
                      <span className="text-sm md:text-base">AI Generated Description</span>
                    </h3>
                    <button
                      type="button"
                      onClick={rejectAIDescription}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div 
                    className="prose prose-sm md:prose-base max-w-none mb-4 p-3 md:p-4 bg-white rounded-lg text-sm md:text-base"
                    dangerouslySetInnerHTML={{ __html: aiDescription }}
                  />
                  <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={approveAIDescription}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 md:py-3 px-4 rounded-xl transition-all text-sm md:text-base"
                    >
                      ✓ Approve & Use
                    </button>
                    <button
                      type="button"
                      onClick={rejectAIDescription}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 md:py-3 px-4 rounded-xl transition-all text-sm md:text-base"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )}

              <RichTextEditor
                value={product.description}
                onChange={(value) => handleInputChange("description", value)}
                placeholder="Describe your product with rich formatting..."
              />
            </div>

            {/* Base Pricing */}
            {!hasWeightVariants && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-2 text-black text-sm md:text-base">
                    Base Price ({currency}) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-2 text-black text-sm md:text-base">
                    Base Offer Price ({currency}) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={product.offerPrice}
                    onChange={(e) => handleInputChange("offerPrice", e.target.value)}
                    className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {/* Product Images */}
            <div>
              <label className="font-semibold block mb-3 text-black text-sm md:text-base">
                Product Images <span className="text-red-600">*</span>
              </label>
              <div className="flex flex-wrap gap-3 md:gap-4">
                {imagePreview.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-2xl border-2 border-[#EB8A14]"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md border-2 border-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                <label className="relative cursor-pointer border-2 border-dashed border-[#EB8A14] rounded-2xl w-24 h-24 md:w-28 md:h-28 flex items-center justify-center hover:border-orange-600 transition-all hover:scale-105 hover:bg-[#bfd9bde0]">
                  <Upload size={20} className="text-[#EB8A14]" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                </label>
              </div>
              {uploadingImages && (
                <p className="text-sm text-[#EB8A14] mt-2">Uploading images...</p>
              )}
            </div>

            {/* Stock Toggle */}
            <div className="flex items-center gap-3 bg-gray-50 p-4 md:p-5 rounded-xl">
              <label className="font-semibold text-black text-sm md:text-base">In Stock</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.inStock}
                  onChange={(e) => handleInputChange("inStock", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-[#EB8A14] transition-colors duration-200"></div>
                <span className="dot absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-6 shadow-md"></span>
              </label>
            </div>
          </div>
        );

      case "seo":
        return (
          <div className="space-y-6">
            {/* SEO METADATA */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                <h3 className="text-lg md:text-xl font-bold text-[#EB8A14]">📄 SEO Metadata</h3>
                <button
                  type="button"
                  onClick={generateAIMetadata}
                  disabled={generatingMetadata || !product.name.trim()}
                  className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-semibold transition-all ${
                    generatingMetadata || !product.name.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                >
                  <Sparkles size={18} className={generatingMetadata ? 'animate-spin' : ''} />
                  {generatingMetadata ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>

              {showMetadataPreview && (
                <div className="mb-4 p-4 md:p-5 border-2 border-purple-500 rounded-xl bg-purple-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm md:text-base font-bold text-purple-700 flex items-center gap-2">
                      <Sparkles size={16} />
                      AI Generated SEO Metadata
                    </h3>
                    <button
                      type="button"
                      onClick={rejectAIMetadata}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-3 mb-3">
                    <div className="p-3 md:p-4 bg-white rounded-lg">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Meta Title ({aiMetadata.title.length}/60)</p>
                      <p className="text-sm md:text-base text-gray-800">{aiMetadata.title}</p>
                    </div>
                    <div className="p-3 md:p-4 bg-white rounded-lg">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Meta Description ({aiMetadata.description.length}/160)</p>
                      <p className="text-sm md:text-base text-gray-800">{aiMetadata.description}</p>
                    </div>
                    <div className="p-3 md:p-4 bg-white rounded-lg">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Meta Keywords</p>
                      <p className="text-sm md:text-base text-gray-800">{aiMetadata.keywords}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={approveAIMetadata}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 md:py-3 px-4 rounded-xl transition-all text-sm md:text-base"
                    >
                      ✓ Approve & Use
                    </button>
                    <button
                      type="button"
                      onClick={rejectAIMetadata}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 md:py-3 px-4 rounded-xl transition-all text-sm md:text-base"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold block mb-2 text-black text-sm md:text-base">
                  Meta Title <span className="text-xs md:text-sm text-gray-500">({(product.metaTitle || '').length}/60)</span>
                </label>
                <input
                  type="text"
                  value={product.metaTitle || ''}
                  onChange={(e) => handleInputChange("metaTitle", e.target.value.slice(0, 60))}
                  maxLength={60}
                  placeholder="SEO-friendly page title"
                  className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">Appears in search results as the page title</p>
              </div>

              <div>
                <label className="font-semibold block mb-2 text-black text-sm md:text-base">
                  Meta Description <span className="text-xs md:text-sm text-gray-500">({(product.metaDescription || '').length}/160)</span>
                </label>
                <textarea
                  value={product.metaDescription || ''}
                  onChange={(e) => handleInputChange("metaDescription", e.target.value.slice(0, 160))}
                  maxLength={160}
                  rows="3"
                  placeholder="Brief SEO description for search engines"
                  className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Appears below the title in search results</p>
              </div>

              <div>
                <label className="font-semibold block mb-2 text-black text-sm md:text-base">
                  Meta Keywords <span className="text-xs md:text-sm text-gray-500">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={product.metaKeywords || ''}
                  onChange={(e) => handleInputChange("metaKeywords", e.target.value)}
                  placeholder="premium nuts, healthy snacks, dry fruits, organic"
                  className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">Relevant keywords for search engines (5-8 keywords recommended)</p>
              </div>
            </div>

            {/* IMAGE ALT TEXT */}
            {imagePreview.length > 0 && (
              <div className="border-t-2 border-[#EB8A14] pt-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                  <h3 className="text-lg md:text-xl font-bold text-[#EB8A14]">Image Accessibility</h3>
                  <button
                    type="button"
                    onClick={generateAllAltTexts}
                    disabled={generatingAltText || !product.name.trim()}
                    className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-semibold transition-all ${
                      generatingAltText || !product.name.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    <Sparkles size={18} className={generatingAltText ? 'animate-spin' : ''} />
                    {generatingAltText ? 'Generating...' : 'Generate All ALT Texts'}
                  </button>
                </div>
                
                <p className="text-xs md:text-sm text-gray-600">
                  ALT text helps search engines understand your images and improves accessibility.
                </p>

                <div className="space-y-3">
                  {imagePreview.map((img, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 p-3 md:p-4 bg-white rounded-xl border-2 border-gray-200">
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full md:w-20 h-40 md:h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <label className="text-xs md:text-sm font-semibold text-gray-700 block mb-2">
                          Image {index + 1} ALT Text <span className="text-gray-400">({((product.imageAltTexts || [])[index] || '').length}/125)</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={(product.imageAltTexts || [])[index] || ''}
                            onChange={(e) => {
                              const newAltTexts = [...(product.imageAltTexts || [])];
                              newAltTexts[index] = e.target.value.slice(0, 125);
                              handleInputChange("imageAltTexts", newAltTexts);
                            }}
                            maxLength={125}
                            placeholder="Descriptive text for this image"
                            className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => generateAltTextForImage(index)}
                            disabled={generatingAltText || !product.name.trim()}
                            className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap flex items-center justify-center ${
                              generatingAltText || !product.name.trim()
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            <Sparkles size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO ANALYSIS */}
            <div className="border-t-2 border-[#EB8A14] pt-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                <h3 className="text-lg md:text-xl font-bold text-[#EB8A14]">SEO Score Analysis</h3>
                <button
                  type="button"
                  onClick={analyzeSEONow}
                  disabled={analyzingSEO || !product.name.trim() || !product.description.trim()}
                  className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-semibold transition-all ${
                    analyzingSEO || !product.name.trim() || !product.description.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                >
                  <Sparkles size={18} className={analyzingSEO ? 'animate-spin' : ''} />
                  {analyzingSEO ? 'Analyzing...' : 'Analyze SEO Score'}
                </button>
              </div>
              
              <p className="text-xs md:text-sm text-gray-600">
                Get a comprehensive SEO analysis with actionable recommendations.
              </p>

              {seoAnalysis ? (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-4 md:p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold ${
                      seoAnalysis.score >= 80 ? 'bg-green-100 text-green-600' :
                      seoAnalysis.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {seoAnalysis.score}
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-bold text-gray-800">
                        {seoAnalysis.score >= 80 ? 'Excellent!' :
                         seoAnalysis.score >= 60 ? 'Good' :
                         'Needs Improvement'}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600">SEO Score out of 100</p>
                    </div>
                  </div>

                  {seoAnalysis.issues && seoAnalysis.issues.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-xs md:text-sm font-bold text-red-600 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        Issues ({seoAnalysis.issues.length})
                      </h5>
                      <ul className="space-y-1">
                        {seoAnalysis.issues.map((issue, idx) => (
                          <li key={idx} className="text-xs md:text-sm text-red-700 pl-4">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {seoAnalysis.warnings && seoAnalysis.warnings.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-xs md:text-sm font-bold text-yellow-600 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                        Warnings ({seoAnalysis.warnings.length})
                      </h5>
                      <ul className="space-y-1">
                        {seoAnalysis.warnings.map((warning, idx) => (
                          <li key={idx} className="text-xs md:text-sm text-yellow-700 pl-4">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {seoAnalysis.suggestions && seoAnalysis.suggestions.length > 0 && (
                    <div>
                      <h5 className="text-xs md:text-sm font-bold text-blue-600 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Suggestions ({seoAnalysis.suggestions.length})
                      </h5>
                      <ul className="space-y-1">
                        {seoAnalysis.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-xs md:text-sm text-blue-700 pl-4">• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-sm md:text-base text-gray-500">Click "Analyze SEO Score" to get detailed insights.</p>
                </div>
              )}
            </div>

            {/* JSON-LD SCHEMA GENERATION */}
            <div className="border-t-2 border-purple-400 pt-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-purple-600 flex items-center gap-2">
                    📋 JSON-LD Structured Data
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    Generate SEO-optimized schema markup for better search visibility
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateJsonLdSchema}
                  disabled={generatingJsonLd || !product.name.trim()}
                  className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-semibold transition-all ${
                    generatingJsonLd || !product.name.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                >
                  <Sparkles size={18} className={generatingJsonLd ? 'animate-spin' : ''} />
                  {generatingJsonLd ? 'Generating...' : '✨ Generate Schema'}
                </button>
              </div>

              {jsonLdSchema ? (
                <div className="bg-white rounded-xl border-2 border-purple-200 p-4 md:p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="text-green-500" size={24} />
                    <h4 className="text-base md:text-lg font-bold text-gray-800">Schema Generated Successfully!</h4>
                  </div>

                  {/* Product Schema */}
                  {jsonLdSchema.productSchema && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h5 className="text-xs md:text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                        Product Schema
                      </h5>
                      <pre className="text-xs bg-white rounded p-3 overflow-x-auto border border-purple-200 max-h-64">
                        {JSON.stringify(jsonLdSchema.productSchema, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Breadcrumb Schema */}
                  {jsonLdSchema.breadcrumbSchema && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="text-xs md:text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        Breadcrumb Schema
                      </h5>
                      <pre className="text-xs bg-white rounded p-3 overflow-x-auto border border-green-200 max-h-64">
                        {JSON.stringify(jsonLdSchema.breadcrumbSchema, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="text-yellow-600 text-sm">💡</span>
                    <p className="text-xs text-yellow-800">
                      This schema will be automatically embedded in your product page for search engines.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 md:py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-sm md:text-base text-gray-500">Click "Generate Schema" to create SEO-optimized structured data.</p>
                </div>
              )}
            </div>
          </div>
        );

      case "advanced":
        return (
          <div className="space-y-6">
            {/* Weight Variants */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                <label className="text-lg md:text-xl font-bold text-[#EB8A14] flex items-center gap-2">
                  ⚖️ Weight Variants {hasWeightVariants && <span className="text-red-600">*</span>}
                </label>
                {hasBasePricing && !hasWeightVariants && (
                  <button
                    onClick={switchToWeightVariants}
                    className="text-sm text-[#EB8A14] hover:text-orange-600 font-semibold"
                  >
                    Switch to Weight Variants
                  </button>
                )}
              </div>

              {product.weights && product.weights.length > 0 && (
                <div className="mb-4 space-y-2">
                  {product.weights.map((w, index) => (
                    <div
                      key={index}
                      className={`flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 rounded-xl border-2 transition-all gap-3 ${
                        editingWeightIndex === index
                          ? "bg-white border-[#EB8A14]"
                          : "bg-[#bfd9bde0] border-[#EB8A14]"
                      }`}
                    >
                      <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
                        <span className="font-semibold text-[#EB8A14]">
                          {w.weight}
                        </span>
                        <span className="text-gray-700">
                          {currency}{w.price}
                        </span>
                        <span className="text-orange-600 font-medium">
                          Offer: {currency}{w.offerPrice}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingWeight(index)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-[#EB8A14] text-white hover:bg-orange-600 text-xs md:text-sm font-medium transition-colors"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWeightVariant(index)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs md:text-sm font-medium transition-colors"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!hasBasePricing || hasWeightVariants) && (
                <div className="space-y-3 bg-white p-4 md:p-5 rounded-xl border-2 border-[#EB8A14]">
                  {editingWeightIndex !== null && (
                    <div className="text-sm font-semibold text-[#EB8A14] mb-2">
                      Editing weight variant
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-black mb-1">
                        Weight (e.g., 50g, 100g, 1kg)
                      </label>
                      <input
                        type="text"
                        value={currentWeight.weight}
                        onChange={(e) =>
                          setCurrentWeight({
                            ...currentWeight,
                            weight: e.target.value,
                          })
                        }
                        placeholder="50g"
                        className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 text-sm md:text-base focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-black mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        value={currentWeight.price}
                        onChange={(e) =>
                          setCurrentWeight({
                            ...currentWeight,
                            price: e.target.value,
                          })
                        }
                        placeholder="100"
                        className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 text-sm md:text-base focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-black mb-1">
                        Offer Price
                      </label>
                      <input
                        type="number"
                        value={currentWeight.offerPrice}
                        onChange={(e) =>
                          setCurrentWeight({
                            ...currentWeight,
                            offerPrice: e.target.value,
                          })
                        }
                        placeholder="80"
                        className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 text-sm md:text-base focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={addWeightVariant}
                      className="flex-1 py-3 bg-gradient-to-r from-[#EB8A14] to-orange-600 hover:from-orange-600 hover:to-[#EB8A14] text-white rounded-xl font-semibold transition-all shadow-lg text-sm md:text-base"
                    >
                      {editingWeightIndex !== null
                        ? "Update Weight Variant"
                        : "Add Weight Variant"}
                    </button>
                    {editingWeightIndex !== null && (
                      <button
                        type="button"
                        onClick={cancelEditingWeight}
                        className="px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 font-semibold transition-colors text-sm md:text-base"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Featured Toggle */}
            <div className="border-t-2 border-[#EB8A14] pt-6">
              <div className="flex flex-col md:flex-row md:items-center gap-3 bg-gray-50 p-4 md:p-5 rounded-xl">
                <label className="font-semibold text-black text-sm md:text-base">Mark as Featured Product</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={product.isFeatured}
                    onChange={(e) => handleInputChange("isFeatured", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-[#EB8A14] transition-colors duration-200"></div>
                  <span className="dot absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-6 shadow-md"></span>
                </label>
                <span className="text-xs md:text-sm text-gray-600">
                  (Featured products appear on the homepage)
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#bfd9bde0]">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#bfd9bde0] flex justify-center items-start py-4 md:py-8 px-3 md:px-4">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl border-4 border-[#EB8A14] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-8 pb-4 md:pb-6">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-[#bfd9bde0] rounded-xl transition-colors border border-[#EB8A14]"
            >
              <ArrowLeft size={20} className="text-[#EB8A14]" />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-black">
              Edit Product Details
            </h2>
          </div>

          {/* Tabs Navigation - Fully Responsive */}
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-1.5 md:gap-2 px-3 py-3 md:py-4 rounded-xl font-semibold text-xs md:text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-br from-[#EB8A14] to-orange-600 text-white shadow-xl transform scale-105"
                      : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200 hover:border-[#EB8A14] hover:shadow-md"
                  }`}
                >
                  <span className="text-center leading-tight">{tab.label}</span>
                  {isTabComplete(tab.id) && activeTab !== tab.id && (
                    <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white rounded-full p-1 shadow-md">
                      <CheckCircle size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 md:px-8 pb-6 md:pb-8">
          <div className="min-h-[300px] md:min-h-[400px]">
            {renderTabContent()}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-6 border-t-2 border-[#EB8A14] mt-6">
            <button
              onClick={handleSave}
              disabled={saving || uploadingImages}
              className="flex-1 px-6 py-3 md:py-4 bg-gradient-to-r from-[#EB8A14] to-orange-600 hover:from-orange-600 hover:to-[#EB8A14] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm md:text-base transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => navigate("/seller/product-list")}
              disabled={saving}
              className="px-6 py-3 md:py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-100 border-2 border-[#EB8A14] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors text-sm md:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductDetails;