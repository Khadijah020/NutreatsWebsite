import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { Trash2, Edit2, Upload, ArrowLeft } from "lucide-react";
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
    weights: [],
  });
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Weight variant state
  const [currentWeight, setCurrentWeight] = useState({
    weight: "",
    price: "",
    offerPrice: "",
  });
  const [editingWeightIndex, setEditingWeightIndex] = useState(null);

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

  // ✅ FIX: Properly handle description state
  const fetchProduct = async () => {
    try {
      const { data } = await axios.post("/api/product/id", { id });
      if (data.success) {
        const productData = data.product;

        // Convert description to string
        let cleanDescription = "";
        
        if (typeof productData.description === "string") {
          cleanDescription = productData.description;
        } else if (Array.isArray(productData.description)) {
          cleanDescription = productData.description
            .filter(item => item && item.trim() !== "")
            .join("<br>");
        }

        // ✅ Set state with the cleaned description
        setProduct({
          ...productData,
          description: cleanDescription
        });
        
        setImagePreview(productData.image);
        
        console.log("📝 Loaded description:", cleanDescription);
        console.log("📝 Description type:", typeof cleanDescription);
      } else {
        toast.error("Failed to load product");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Make sure handleInputChange properly updates description
  const handleInputChange = (field, value) => {
    console.log(`🔄 Updating ${field}:`, value);
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
        setProduct((prev) => ({
          ...prev,
          image: [...prev.image, ...data.imageUrls],
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
    }));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ FIX: Debug and ensure description is included
  const handleSave = async () => {
    // Log the current state before saving
    console.log("📋 Current product state:", product);
    console.log("📋 Description value:", product.description);
    console.log("📋 Description type:", typeof product.description);

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
        weights: product.weights || [],
        description: product.description || "",
      };

      console.log("💾 Sending to backend:", updateData);
      console.log("💾 Description being sent:", updateData.description);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#e6dbcee0]">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] py-6 px-4">
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-amber-100/50 rounded-xl transition-colors border border-amber-200/30"
            >
              <ArrowLeft size={20} className="text-[#8B2E1A]" />
            </button>
            <h2 className="text-2xl font-bold text-[#8B2E1A]">
              Edit Product Details
            </h2>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-linear-to-br from-[#AD3A24] to-[#8B2E1A] rounded-3xl p-1.5 border border-amber-200/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-amber-300/30 rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-amber-300/30 rounded-br-3xl"></div>

          <div className="bg-[#ecd4d0] rounded-2xl p-6 md:p-10 space-y-6 relative">
            <div className="absolute top-3 right-3 w-12 h-12 border-t border-r border-amber-200/40 rounded-tr-xl"></div>
            <div className="absolute bottom-3 left-3 w-12 h-12 border-b border-l border-amber-200/40 rounded-bl-xl"></div>

            <div className="relative z-10 space-y-6">
              {/* Product Name */}
              <div>
                <label className="block font-semibold mb-2 text-[#8B2E1A]">
                  Product Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD3A24] focus:border-transparent bg-white/80"
                  placeholder="Enter product name"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold mb-2 text-[#8B2E1A]">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  value={product.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD3A24] focus:border-transparent bg-white/80"
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
                <label className="block font-semibold mb-2 text-[#8B2E1A]">
                  Product Description
                </label>
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
                    <label className="block font-semibold mb-2 text-[#8B2E1A]">
                      Base Price <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                        {currency}
                      </span>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD3A24] focus:border-transparent bg-white/80"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[#8B2E1A]">
                      Base Offer Price <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                        {currency}
                      </span>
                      <input
                        type="number"
                        value={product.offerPrice}
                        onChange={(e) => handleInputChange("offerPrice", e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD3A24] focus:border-transparent bg-white/80"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Weight Variants Section */}
              <div className="border-t-2 border-amber-200/50 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block font-semibold text-[#8B2E1A]">
                    Weight Variants{" "}
                    {hasWeightVariants && <span className="text-red-600">*</span>}
                  </label>
                  {hasBasePricing && !hasWeightVariants && (
                    <button
                      onClick={switchToWeightVariants}
                      className="text-sm text-[#AD3A24] hover:text-[#8B2E1A] font-semibold"
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
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                          editingWeightIndex === index
                            ? "bg-white/80 border-[#AD3A24]"
                            : "bg-white/60 border-amber-200/50"
                        }`}
                      >
                        <div className="flex gap-4 text-sm">
                          <span className="font-semibold text-gray-900">
                            {w.weight}
                          </span>
                          <span className="text-gray-700">
                            {currency}{w.price}
                          </span>
                          <span className="text-[#AD3A24] font-medium">
                            Offer: {currency}{w.offerPrice}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditingWeight(index)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#AD3A24] text-white hover:bg-[#8B2E1A] text-sm font-medium transition-colors"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeWeightVariant(index)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors"
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
                  <div className="space-y-3 bg-white/60 p-4 rounded-xl border-2 border-amber-200/50">
                    {editingWeightIndex !== null && (
                      <div className="text-sm font-semibold text-[#AD3A24] mb-2">
                        Editing weight variant
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-[#8B2E1A] mb-1">
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
                        className="w-full px-3 py-2 border-2 border-amber-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD3A24] focus:border-transparent bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-[#8B2E1A] mb-1">
                          Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
                            {currency}
                          </span>
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
                            className="w-full pl-10 pr-3 py-2 border-2 border-amber-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD3A24] focus:border-transparent bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#8B2E1A] mb-1">
                          Offer Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
                            {currency}
                          </span>
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
                            className="w-full pl-10 pr-3 py-2 border-2 border-amber-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD3A24] focus:border-transparent bg-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addWeightVariant}
                        className="flex-1 py-2.5 bg-linear-to-r from-[#AD3A24] to-[#8B2E1A] text-white rounded-xl hover:from-[#8B2E1A] hover:to-[#AD3A24] font-semibold transition-all shadow-md"
                      >
                        {editingWeightIndex !== null
                          ? "Update Weight Variant"
                          : "Add Weight Variant"}
                      </button>
                      {editingWeightIndex !== null && (
                        <button
                          type="button"
                          onClick={cancelEditingWeight}
                          className="px-4 py-2.5 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Images */}
              <div>
                <label className="block font-semibold mb-2 text-[#8B2E1A]">
                  Product Images <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {imagePreview.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl border-2 border-amber-200/50"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="relative flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-amber-200 rounded-xl cursor-pointer hover:border-[#AD3A24] hover:bg-white/50 transition-all bg-white/30">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Upload size={20} className="text-[#AD3A24]" />
                    <span className="text-sm font-semibold">
                      {uploadingImages ? "Uploading..." : "Choose images to upload"}
                    </span>
                  </div>
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

              {/* In Stock Toggle */}
              <div className="flex items-center gap-3 border-t-2 border-amber-200/50 pt-6">
                <label className="font-semibold text-[#8B2E1A]">In Stock</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={product.inStock}
                    onChange={(e) => handleInputChange("inStock", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-gray-300 rounded-full peer peer-checked:bg-[#AD3A24] transition-colors duration-200"></div>
                  <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5 shadow-sm"></span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t-2 border-amber-200/50">
                <button
                  onClick={handleSave}
                  disabled={saving || uploadingImages}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-[#AD3A24] to-[#8B2E1A] text-white rounded-xl hover:from-[#8B2E1A] hover:to-[#AD3A24] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-md"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => navigate("/seller/product-list")}
                  disabled={saving}
                  className="px-6 py-3 bg-white/80 text-gray-700 rounded-xl hover:bg-white border-2 border-amber-200/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductDetails;