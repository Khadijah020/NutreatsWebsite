import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { Trash2, Edit2, Upload } from "lucide-react";
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
    <div className="min-h-screen bg-[#e6dbcee0] py-8 px-4 sm:px-6">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Edit Product Details
          </h2>
          <button
            onClick={() => navigate("/seller/product-list")}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-10 space-y-6 border border-gray-200">
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={product.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Description Editor with Debug Info */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Product Description
            </label>
            <RichTextEditor
              value={product.description}
              onChange={(value) => {
                console.log("✏️ Editor onChange called with:", value);
                handleInputChange("description", value);
              }}
              placeholder="Describe your product with rich formatting..."
            />
            {/* Debug display */}
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <strong>Debug:</strong> Current description length: {product.description?.length || 0}
              {product.description && <> | Has content: Yes</>}
            </div>
          </div>

          {!hasWeightVariants && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Base Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {currency}
                  </span>
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Base Offer Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {currency}
                  </span>
                  <input
                    type="number"
                    value={product.offerPrice}
                    onChange={(e) =>
                      handleInputChange("offerPrice", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Weight Variants Section - keeping your existing code */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block font-medium text-gray-700">
                Weight Variants{" "}
                {hasWeightVariants && <span className="text-red-500">*</span>}
              </label>
              {hasBasePricing && !hasWeightVariants && (
                <button
                  onClick={switchToWeightVariants}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
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
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      editingWeightIndex === index
                        ? "bg-emerald-50 border-emerald-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex gap-4 text-sm">
                      <span className="font-medium text-gray-900">
                        {w.weight}
                      </span>
                      <span className="text-gray-600">
                        {currency}
                        {w.price}
                      </span>
                      <span className="text-emerald-600">
                        Offer: {currency}
                        {w.offerPrice}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditingWeight(index)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm font-medium transition-colors"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeWeightVariant(index)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium transition-colors"
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
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {editingWeightIndex !== null && (
                  <div className="text-sm font-medium text-emerald-600 mb-2">
                    Editing weight variant
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Offer Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addWeightVariant}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm"
                  >
                    {editingWeightIndex !== null
                      ? "Update Weight Variant"
                      : "Add Weight Variant"}
                  </button>
                  {editingWeightIndex !== null && (
                    <button
                      type="button"
                      onClick={cancelEditingWeight}
                      className="px-4 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors"
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
            <label className="block font-medium mb-2 text-gray-700">
              Product Images <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {imagePreview.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <label className="relative flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all">
              <div className="flex items-center gap-2 text-gray-600">
                <Upload size={20} className="text-emerald-500" />
                <span className="text-sm font-medium">
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

          <div className="flex items-center gap-3 border-t border-gray-200 pt-6">
            <label className="font-medium text-gray-700">In Stock</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={product.inStock}
                onChange={(e) => handleInputChange("inStock", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
              <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5 shadow-sm"></span>
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving || uploadingImages}
              className="flex-1 px-6 py-3 bg-green-700 text-white rounded-xl hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all hover:scale-[1.02] shadow-sm"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => navigate("/seller/product-list")}
              disabled={saving}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
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