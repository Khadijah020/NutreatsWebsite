import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { PlusCircle, X, Upload, Sparkles, CheckCircle } from "lucide-react";
import RichTextEditor from "../../components/seller/RichTextEditor.jsx";

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const { axios } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [generatingMetadata, setGeneratingMetadata] = useState(false);
  const [aiMetadata, setAiMetadata] = useState({ title: '', description: '', keywords: '' });
  const [showMetadataPreview, setShowMetadataPreview] = useState(false);
  const [imageAltTexts, setImageAltTexts] = useState([]);
  const [seoAnalysis, setSeoAnalysis] = useState(null);
  const [analyzingSEO, setAnalyzingSEO] = useState(false);
  const [jsonLdSchema, setJsonLdSchema] = useState(null);
  const [generatingJsonLd, setGeneratingJsonLd] = useState(false);

  const [weights, setWeights] = useState([]);
  const [currentWeight, setCurrentWeight] = useState({
    weight: "",
    price: "",
    offerPrice: "",
  });

  // Tab state
  const [activeTab, setActiveTab] = useState("basic");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "seo", label: "SEO & Schema" },
    { id: "advanced", label: "Weight Variants" }
  ];

  // Check tab completion status
  const isTabComplete = (tabId) => {
    switch(tabId) {
      case "basic":
        return name.trim() && description.trim() && category && (price || weights.length > 0);
      case "seo":
        return metaTitle.trim() || metaDescription.trim() || imageAltTexts.some(alt => alt?.trim()) || jsonLdSchema !== null;
      case "advanced":
        return weights.length > 0 || isFeatured;
      default:
        return false;
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/category/list`);
        const data = await response.json();
        if (data.success) {
          const activeCategories = data.categories.filter(cat => cat.isActive);
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [backendUrl]);

  const addWeightVariant = () => {
    if (!currentWeight.weight || !currentWeight.price || !currentWeight.offerPrice) {
      toast.error("Please fill all weight fields");
      return;
    }
    setWeights([...weights, currentWeight]);
    setCurrentWeight({ weight: "", price: "", offerPrice: "" });
    toast.success("Weight variant added");
  };

  const removeWeightVariant = (index) => {
    setWeights(weights.filter((_, i) => i !== index));
  };

  const generateAIDescription = async () => {
    if (!name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }

    try {
      setGeneratingAI(true);
      const { data } = await axios.post("/api/ai/generate-description", {
        productName: name,
        category: category || null,
        weights: weights.length > 0 ? weights : null,
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
    setDescription(aiDescription);
    setShowAIPreview(false);
    setAiDescription("");
    toast.success("Description approved and added!");
  };

  const rejectAIDescription = () => {
    setShowAIPreview(false);
    setAiDescription("");
    toast("Description rejected");
  };

  const generateAIMetadata = async () => {
    if (!name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }

    try {
      setGeneratingMetadata(true);
      const { data } = await axios.post("/api/ai/generate-metadata", {
        productName: name,
        category: category || null,
        description: description || null,
      });

      if (data.success) {
        setAiMetadata({ title: data.metaTitle, description: data.metaDescription, keywords: data.metaKeywords || '' });
        setShowMetadataPreview(true);
        toast.success("SEO metadata generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate metadata");
      }
    } catch (error) {
      console.error("Error generating metadata:", error);
      toast.error(error.response?.data?.message || "Failed to generate metadata");
    } finally {
      setGeneratingMetadata(false);
    }
  };

  const approveAIMetadata = () => {
    setMetaTitle(aiMetadata.title);
    setMetaDescription(aiMetadata.description);
    setMetaKeywords(aiMetadata.keywords);
    setShowMetadataPreview(false);
    setAiMetadata({ title: '', description: '', keywords: '' });
    toast.success("Metadata approved and added!");
  };

  const rejectAIMetadata = () => {
    setShowMetadataPreview(false);
    setAiMetadata({ title: '', description: '', keywords: '' });
    toast("Metadata rejected");
  };

  const generateAltTextForImage = async (index) => {
    if (!name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }

    try {
      const { data } = await axios.post("/api/ai/generate-image-alt", {
        productName: name,
        category: category || null,
        imageIndex: index,
      });

      if (data.success) {
        const newAltTexts = [...imageAltTexts];
        newAltTexts[index] = data.altText;
        setImageAltTexts(newAltTexts);
        toast.success(`ALT text generated for image ${index + 1}!`);
      } else {
        toast.error(data.message || "Failed to generate ALT text");
      }
    } catch (error) {
      console.error("Error generating ALT text:", error);
      toast.error(error.response?.data?.message || "Failed to generate ALT text");
    }
  };

  const generateAllAltTexts = async () => {
    if (!name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }

    if (files.length === 0) {
      toast.error("Please upload images first");
      return;
    }

    toast.loading("Generating ALT texts for all images...");

    try {
      const altTextPromises = files.map((_, index) =>
        axios.post("/api/ai/generate-image-alt", {
          productName: name,
          category: category || null,
          imageIndex: index,
        })
      );

      const results = await Promise.all(altTextPromises);
      const newAltTexts = results.map((res) => res.data.success ? res.data.altText : "");
      setImageAltTexts(newAltTexts);
      toast.dismiss();
      toast.success(`Generated ALT text for ${files.length} images!`);
    } catch (error) {
      toast.dismiss();
      console.error("Error generating ALT texts:", error);
      toast.error("Failed to generate some ALT texts");
    }
  };



  const analyzeSEONow = async () => {
    try {
      setAnalyzingSEO(true);
      const { data } = await axios.post("/api/ai/analyze-seo", {
        productName: name,
        description: description || "",
        metaTitle: metaTitle || "",
        metaDescription: metaDescription || "",
        category: category || "",
        images: files.map((_, i) => `image${i}`),
      });

      if (data.success) {
        setSeoAnalysis(data.analysis);
        toast.success("SEO analysis complete!");
      } else {
        toast.error(data.message || "Failed to analyze SEO");
      }
    } catch (error) {
      console.error("Error analyzing SEO:", error);
      toast.error(error.response?.data?.message || "Failed to analyze SEO");
    } finally {
      setAnalyzingSEO(false);
    }
  };

  const generateJsonLdSchema = async () => {
    if (!name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }

    try {
      setGeneratingJsonLd(true);
      const { data } = await axios.post("/api/ai/generate-json-ld", {
        productName: name,
        category: category || null,
        description: description || null,
        price: price || null,
        offerPrice: offerPrice || null,
        weights: weights || [],
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

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!weights.length && (!price || !offerPrice)) {
      toast.error("Please add base price or at least one weight variant.");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    try {
      setLoading(true);
      const productData = {
        name,
        description: description || "",
        category,
        price: weights.length ? null : price,
        offerPrice: weights.length ? null : offerPrice,
        weights,
        isFeatured,
        metaTitle: metaTitle || "",
        metaDescription: metaDescription || "",
        metaKeywords: metaKeywords || "",
        imageAltTexts: imageAltTexts || [],
        jsonLdSchema: jsonLdSchema || null,
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));
      files.forEach((file) => file && formData.append("images", file));

      const { data } = await axios.post("/api/product/add", formData);

      if (data.success) {
        toast.success(data.message);
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setOfferPrice("");
        setFiles([]);
        setWeights([]);
        setIsFeatured(false);
        setMetaTitle("");
        setMetaDescription("");
        setMetaKeywords("");
        setImageAltTexts([]);
        setSeoAnalysis(null);
        setJsonLdSchema(null);
        setActiveTab("basic");
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case "basic":
        return (
          <div className="space-y-6">
            {/* Upload Images */}
            <div>
              <p className="text-base font-semibold mb-2 text-black">Product Images</p>
              <div className="flex flex-wrap gap-4">
                {files.map((file, index) => (
                  <label
                    key={index}
                    className="relative cursor-pointer border-2 border-dashed border-[#EB8A14] rounded-2xl w-28 h-28 flex items-center justify-center hover:border-orange-600 transition-all hover:scale-105 hover:bg-[#bfd9bde0]"
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const updatedFiles = [...files];
                        updatedFiles[index] = e.target.files[0];
                        setFiles(updatedFiles);
                      }}
                    />
                    {file ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="uploaded"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <Upload className="text-black w-8 h-8" />
                    )}
                    {file && (
                      <button
                        type="button"
                        onClick={() => {
                          setFiles(files.filter((_, i) => i !== index));
                          setImageAltTexts(imageAltTexts.filter((_, i) => i !== index));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 border-2 border-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </label>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setFiles([...files, null]);
                    setImageAltTexts([...imageAltTexts, '']);
                  }}
                  className="border-2 border-dashed border-[#EB8A14] rounded-2xl w-28 h-28 flex items-center justify-center hover:border-orange-600 transition-all hover:scale-105 hover:bg-[#bfd9bde0]"
                >
                  <PlusCircle className="text-[#EB8A14] w-8 h-8" />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <label className="font-semibold block mb-1 text-black">
                  Product Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  type="text"
                  placeholder="e.g. Premium Almonds"
                  className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-black">
                  Description
                </label>
                
                {/* AI Generate Button */}
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={generateAIDescription}
                    disabled={generatingAI || !name.trim()}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      generatingAI || !name.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                    }`}
                  >
                    <Sparkles size={18} className={generatingAI ? "animate-spin" : ""} />
                    {generatingAI ? "Generating..." : "✨ Generate with AI"}
                  </button>
                </div>

                {/* AI Preview Modal */}
                {showAIPreview && (
                  <div className="mb-4 p-4 border-2 border-purple-500 rounded-xl bg-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-purple-700 flex items-center gap-2">
                        <Sparkles size={18} />
                        AI Generated Description
                      </h3>
                      <button
                        type="button"
                        onClick={rejectAIDescription}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div 
                      className="prose max-w-none mb-3 p-3 bg-white rounded-lg"
                      dangerouslySetInnerHTML={{ __html: aiDescription }}
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={approveAIDescription}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        ✓ Approve & Use
                      </button>
                      <button
                        type="button"
                        onClick={rejectAIDescription}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                )}

                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe your product with formatting..."
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-black">
                  Category
                </label>
                {loadingCategories ? (
                  <div className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 bg-white text-[#EB8A14]">
                    Loading categories...
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((item) => (
                      <option key={item._id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Base Price */}
              {!weights.length && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1 text-black">
                      Base Price (Rs.)
                    </label>
                    <input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      type="number"
                      placeholder="0"
                      className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-black">
                      Base Offer Price (Rs.)
                    </label>
                    <input
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      type="number"
                      placeholder="0"
                      className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "seo":
        return (
          <div className="space-y-6">
            {/* SEO METADATA */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold text-[#EB8A14]">📄 SEO Metadata</h3>
                <button
                  type="button"
                  onClick={generateAIMetadata}
                  disabled={generatingMetadata || !name.trim()}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    generatingMetadata || !name.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  <Sparkles size={18} className={generatingMetadata ? 'animate-spin' : ''} />
                  {generatingMetadata ? 'Generating...' : '✨ Generate with AI'}
                </button>
              </div>

              {/* AI Metadata Preview */}
              {showMetadataPreview && (
                <div className="mb-4 p-4 border-2 border-purple-500 rounded-xl bg-purple-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2">
                      <Sparkles size={16} />
                      AI Generated SEO Metadata
                    </h3>
                    <button
                      type="button"
                      onClick={rejectAIMetadata}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-3 mb-3">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Meta Title ({aiMetadata.title.length}/60)</p>
                      <p className="text-sm text-gray-800">{aiMetadata.title}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Meta Description ({aiMetadata.description.length}/160)</p>
                      <p className="text-sm text-gray-800">{aiMetadata.description}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Meta Keywords</p>
                      <p className="text-sm text-gray-800">{aiMetadata.keywords}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={approveAIMetadata}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      ✓ Approve & Use
                    </button>
                    <button
                      type="button"
                      onClick={rejectAIMetadata}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold block mb-1 text-black">
                  Meta Title <span className="text-sm text-gray-500">({metaTitle.length}/60)</span>
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))}
                  maxLength={60}
                  placeholder="SEO-friendly page title"
                  className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">Appears in search results as the page title</p>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-black">
                  Meta Description <span className="text-sm text-gray-500">({metaDescription.length}/160)</span>
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
                  maxLength={160}
                  rows="3"
                  placeholder="Brief SEO description for search engines"
                  className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Appears below the title in search results</p>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-black">
                  Meta Keywords <span className="text-sm text-gray-500">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="premium nuts, healthy snacks, dry fruits, organic"
                  className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">Relevant keywords for search engines (5-8 keywords recommended)</p>
              </div>
            </div>

            {/* IMAGE ALT TEXT */}
            {files.some(file => file !== null) && (
              <div className="border-t-2 border-[#EB8A14] pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h3 className="text-lg font-bold text-[#EB8A14]">Image Accessibility</h3>
                  <button
                    type="button"
                    onClick={generateAllAltTexts}
                    disabled={!name.trim()}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      !name.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    <Sparkles size={18} />
                    ✨ Generate All ALT Texts
                  </button>
                </div>
                
                <p className="text-sm text-gray-600">
                  ALT text helps search engines understand your images and improves accessibility.
                </p>

                <div className="space-y-3">
                  {files.map((file, index) => file && (
                    <div key={index} className="flex gap-3 p-3 bg-white rounded-lg border-2 border-gray-200">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Product ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <label className="text-sm font-semibold text-gray-700 block mb-1">
                          Image {index + 1} ALT Text <span className="text-gray-400">({(imageAltTexts[index] || '').length}/125)</span>
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={imageAltTexts[index] || ''}
                            onChange={(e) => {
                              const newAltTexts = [...imageAltTexts];
                              newAltTexts[index] = e.target.value.slice(0, 125);
                              setImageAltTexts(newAltTexts);
                            }}
                            maxLength={125}
                            placeholder="Descriptive text for this image"
                            className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => generateAltTextForImage(index)}
                            disabled={!name.trim()}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                              !name.trim()
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold text-[#EB8A14]">SEO Score Analysis</h3>
                <button
                  type="button"
                  onClick={analyzeSEONow}
                  disabled={analyzingSEO || !name.trim() || !description.trim()}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    analyzingSEO || !name.trim() || !description.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  <Sparkles size={18} className={analyzingSEO ? 'animate-spin' : ''} />
                  {analyzingSEO ? 'Analyzing...' : '✨ Analyze SEO'}
                </button>
              </div>
              
              <p className="text-sm text-gray-600">
                Get a comprehensive SEO analysis with actionable recommendations.
              </p>

              {seoAnalysis ? (
                <div className="bg-white rounded-lg border-2 border-gray-200 p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
                      seoAnalysis.score >= 80 ? 'bg-green-100 text-green-600' :
                      seoAnalysis.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {seoAnalysis.score}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">
                        {seoAnalysis.score >= 80 ? 'Excellent!' :
                         seoAnalysis.score >= 60 ? 'Good' :
                         'Needs Improvement'}
                      </h4>
                      <p className="text-sm text-gray-600">SEO Score out of 100</p>
                    </div>
                  </div>

                  {seoAnalysis.issues && seoAnalysis.issues.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-bold text-red-600 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        Issues ({seoAnalysis.issues.length})
                      </h5>
                      <ul className="space-y-1">
                        {seoAnalysis.issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-red-700 pl-4">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {seoAnalysis.warnings && seoAnalysis.warnings.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-bold text-yellow-600 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                        Warnings ({seoAnalysis.warnings.length})
                      </h5>
                      <ul className="space-y-1">
                        {seoAnalysis.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm text-yellow-700 pl-4">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {seoAnalysis.suggestions && seoAnalysis.suggestions.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-blue-600 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Suggestions ({seoAnalysis.suggestions.length})
                      </h5>
                      <ul className="space-y-1">
                        {seoAnalysis.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-blue-700 pl-4">• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">Click "Analyze SEO Score" to get detailed insights.</p>
                </div>
              )}
            </div>

            {/* JSON-LD SCHEMA GENERATION */}
            <div className="border-t-2 border-purple-400 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-purple-600 flex items-center gap-2">
                    📋 JSON-LD Structured Data
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Generate SEO-optimized schema markup for better search visibility
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateJsonLdSchema}
                  disabled={generatingJsonLd || !name.trim()}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    generatingJsonLd || !name.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  <Sparkles size={18} className={generatingJsonLd ? 'animate-spin' : ''} />
                  {generatingJsonLd ? 'Generating...' : '✨ Generate Schema'}
                </button>
              </div>

              {jsonLdSchema ? (
                <div className="bg-white rounded-lg border-2 border-purple-200 p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="text-green-500" size={24} />
                    <h4 className="text-lg font-bold text-gray-800">Schema Generated Successfully!</h4>
                  </div>

                  {/* Product Schema */}
                  {jsonLdSchema.productSchema && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h5 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
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
                      <h5 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
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
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">Click "Generate Schema" to create SEO-optimized structured data.</p>
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
              <p className="text-lg font-bold mb-3 text-[#EB8A14] flex items-center gap-2">
                Weight Variants (optional)
              </p>

              {weights.length > 0 && (
                <div className="space-y-2 mb-3">
                  {weights.map((w, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-[#bfd9bde0] px-4 py-2 rounded-xl border-2 border-[#EB8A14]"
                    >
                      <div className="flex gap-4 text-sm text-gray-800">
                        <span className="font-medium text-[#EB8A14]">{w.weight}</span>
                        <span className="text-[#EB8A14]">Rs.{w.price}</span>
                        <span className="text-orange-600 font-semibold">Offer: Rs.{w.offerPrice}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeWeightVariant(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={currentWeight.weight}
                  onChange={(e) => setCurrentWeight({ ...currentWeight, weight: e.target.value })}
                  type="text"
                  placeholder="Weight (e.g. 100g)"
                  className="border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                />
                <input
                  value={currentWeight.price}
                  onChange={(e) => setCurrentWeight({ ...currentWeight, price: e.target.value })}
                  type="number"
                  placeholder="Price"
                  className="border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                />
                <input
                  value={currentWeight.offerPrice}
                  onChange={(e) => setCurrentWeight({ ...currentWeight, offerPrice: e.target.value })}
                  type="number"
                  placeholder="Offer Price"
                  className="border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                />
              </div>

              <button
                type="button"
                onClick={addWeightVariant}
                className="mt-4 flex items-center justify-center w-full gap-2 bg-[#EB8A14] hover:bg-orange-600 text-white font-semibold rounded-xl py-3 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusCircle size={20} /> Add Weight Variant
              </button>
            </div>

            {/* Featured Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t-2 border-[#EB8A14] pt-6">
              <div className="flex items-center gap-3">
                <label className="font-semibold text-black">Mark as Featured</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-gray-300 rounded-full peer peer-checked:bg-[#EB8A14] transition-colors duration-200"></div>
                  <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5 shadow-sm"></span>
                </label>
              </div>
              <span className="text-sm text-gray-600">
                Featured products appear on the homepage
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#bfd9bde0] flex justify-center items-start py-4 md:py-8 px-2 md:px-4">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-6xl mx-auto bg-white rounded-2xl border-4 border-[#EB8A14] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 md:p-8 pb-0">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-4 md:mb-6">
            Add New Product
          </h2>

          {/* Tabs Navigation - Mobile Responsive */}
          <div className="mb-6 md:mb-8">
            {/* Mobile: Stacked vertical tabs */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === tab.id
                      ? "bg-[#EB8A14] text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-center leading-tight">{tab.label}</span>
                  {isTabComplete(tab.id) && activeTab !== tab.id && (
                    <CheckCircle size={14} className="absolute top-2 right-2 text-green-500 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Desktop: Horizontal tabs */}
            <div className="hidden md:grid md:grid-cols-3 gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-[#EB8A14] text-white shadow-xl transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                  }`}
                >
                  <span className="text-center">{tab.label}</span>
                  {isTabComplete(tab.id) && activeTab !== tab.id && (
                    <CheckCircle size={18} className="absolute top-3 right-3 text-green-500 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-8 pt-0">
          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || loadingCategories}
            className={`w-full py-4 mt-8 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              loading || loadingCategories
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#EB8A14] hover:bg-orange-600 shadow-xl hover:shadow-2xl transform hover:scale-105"
            }`}
          >
            {loading && <span className="animate-spin border-3 border-white border-t-transparent rounded-full w-5 h-5"></span>}
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;