import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { Trash2, Edit2, Upload, ArrowLeft, X } from "lucide-react";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#bfd9bde0]">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#bfd9bde0] flex justify-center items-start py-8 md:py-12 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl border-4 border-[#EB8A14] overflow-hidden">
        <div className="p-8 md:p-12 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-[#bfd9bde0] rounded-xl transition-colors border border-[#EB8A14]"
              >
                <ArrowLeft size={20} className="text-[#EB8A14]" />
              </button>
              <h2 className="text-3xl font-bold text-center text-black">
                Edit Product Details
              </h2>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="font-semibold block mb-1 text-black">
              Product Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
              placeholder="Enter product name"
            />
          </div>

          {/* Category */}
          <div>
            <label className="font-semibold block mb-1 text-black">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              value={product.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
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
            <label className="font-semibold block mb-1 text-black">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1 text-black">
                  Base Price ({currency}) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-black">
                  Base Offer Price ({currency}) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={product.offerPrice}
                  onChange={(e) => handleInputChange("offerPrice", e.target.value)}
                  className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Weight Variants Section */}
          <div className="border-t-2 border-[#EB8A14] pt-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-lg font-bold text-[#EB8A14] flex items-center gap-2">
                Weight Variants {hasWeightVariants && <span className="text-red-600">*</span>}
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
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      editingWeightIndex === index
                        ? "bg-white border-[#EB8A14]"
                        : "bg-[#bfd9bde0] border-[#EB8A14]"
                    }`}
                  >
                    <div className="flex gap-4 text-sm">
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
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EB8A14] text-white hover:bg-orange-600 text-sm font-medium transition-colors"
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
              <div className="space-y-3 bg-white p-4 rounded-xl border-2 border-[#EB8A14]">
                {editingWeightIndex !== null && (
                  <div className="text-sm font-semibold text-[#EB8A14] mb-2">
                    Editing weight variant
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1">
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
                      className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1">
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
                      className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1">
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
                      className="w-full border-2 border-[#EB8A14] shadow-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addWeightVariant}
                    className="flex-1 py-2.5 bg-[#EB8A14] text-white rounded-xl hover:bg-orange-600 font-semibold transition-all shadow-md"
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
            <label className="font-semibold block mb-2 text-black">
              Product Images <span className="text-red-600">*</span>
            </label>
            <div className="flex flex-wrap gap-4 mb-4">
              {imagePreview.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Product ${index + 1}`}
                    className="w-28 h-28 object-cover rounded-2xl border-2 border-[#EB8A14]"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md border-2 border-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              <label className="relative cursor-pointer border-2 border-dashed border-[#EB8A14] rounded-2xl w-28 h-28 flex items-center justify-center hover:border-orange-600 transition-all hover:scale-105 hover:bg-[#bfd9bde0]">
                <div className="flex items-center gap-2 text-gray-700">
                  <Upload size={20} className="text-[#EB8A14]" />
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
          </div>

          {/* Toggles Section */}
          <div className="space-y-4 border-t-2 border-[#EB8A14] pt-6">
            {/* In Stock Toggle */}
            <div className="flex items-center gap-3">
              <label className="font-semibold text-black">In Stock</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.inStock}
                  onChange={(e) => handleInputChange("inStock", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-300 rounded-full peer peer-checked:bg-[#EB8A14] transition-colors duration-200"></div>
                <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5 shadow-sm"></span>
              </label>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center gap-3">
              <label className="font-semibold text-black">Mark as Featured</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.isFeatured}
                  onChange={(e) => handleInputChange("isFeatured", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-300 rounded-full peer peer-checked:bg-[#EB8A14] transition-colors duration-200"></div>
                <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5 shadow-sm"></span>
              </label>
              <span className="text-sm text-gray-600">
                (Featured products appear on the homepage)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t-2 border-[#EB8A14]">
            <button
              onClick={handleSave}
              disabled={saving || uploadingImages}
              className="flex-1 px-6 py-3 bg-[#EB8A14] text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-md border-2 border-[#EB8A14]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => navigate("/seller/product-list")}
              disabled={saving}
              className="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-100 border-2 border-[#EB8A14] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
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