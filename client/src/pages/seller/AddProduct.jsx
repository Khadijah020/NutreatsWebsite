import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { PlusCircle, X, Upload } from "lucide-react";
import RichTextEditor from "../../components/seller/RichTextEditor.jsx";

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const { axios } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [weights, setWeights] = useState([]);
  const [currentWeight, setCurrentWeight] = useState({
    weight: "",
    price: "",
    offerPrice: "",
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backendUrl}api/category/list`);
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
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex justify-center items-start py-8 md:py-12 overflow-y-auto">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-6xl mx-auto bg-linear-to-br from-[#AD3A24] to-[#8B2E1A] rounded-3xl p-1.5 border border-amber-200/20 relative overflow-hidden"
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-amber-300/30 rounded-tl-3xl"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-amber-300/30 rounded-br-3xl"></div>

        <div className="bg-[#ecd4d0] rounded-2xl p-8 md:p-12 space-y-6 relative">
          {/* Inner decorative corners */}
          <div className="absolute top-3 right-3 w-12 h-12 border-t border-r border-amber-200/40 rounded-tr-xl"></div>
          <div className="absolute bottom-3 left-3 w-12 h-12 border-b border-l border-amber-200/40 rounded-bl-xl"></div>

          <h2 className="text-3xl font-bold text-center text-[#8B2E1A] relative z-10">
            Add New Product
          </h2>

          {/* Upload Images */}
          <div className="relative z-10">
            <p className="text-base font-semibold mb-2 text-gray-700">Product Images</p>
            <div className="flex flex-wrap gap-4">
              {files.map((file, index) => (
                <label
                  key={index}
                  className="relative cursor-pointer border border-dashed border-amber-300 rounded-2xl w-28 h-28 flex items-center justify-center hover:border-[#AD3A24] transition-all hover:scale-105 hover:bg-white/50"
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
                    <Upload className="text-[#AD3A24] w-8 h-8" />
                  )}
                  {file && (
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </label>
              ))}

              <button
                type="button"
                onClick={() => setFiles([...files, null])}
                className="border border-dashed border-amber-300 rounded-2xl w-28 h-28 flex items-center justify-center hover:border-[#AD3A24] transition-all hover:scale-105 hover:bg-white/50"
              >
                <PlusCircle className="text-[#AD3A24] w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 relative z-10">
            <div>
              <label className="font-semibold block mb-1 text-gray-700">
                Product Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                type="text"
                placeholder="e.g. Premium Almonds"
                className="w-full border border-amber-200/50 shadow-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-[#AD3A24] focus:border-[#AD3A24] outline-none bg-white/80"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-gray-700">
                Description
              </label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe your product with formatting..."
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-gray-700">
                Category
              </label>
              {loadingCategories ? (
                <div className="w-full border border-amber-200/50 shadow-sm rounded-xl px-3 py-2.5 bg-white/80 text-gray-500">
                  Loading categories...
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full border border-amber-200/50 shadow-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-[#AD3A24] focus:border-[#AD3A24] outline-none bg-white/80"
                >
                  <option value="">Select Category</option>
                  {categories.map((item) => (
                    <option key={item._id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
              {!loadingCategories && categories.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No categories available. Please add categories first.
                </p>
              )}
            </div>
          </div>

          {/* Base Price */}
          {!weights.length && (
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div>
                <label className="font-semibold block mb-1 text-gray-700">
                  Base Price (Rs.)
                </label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  placeholder="0"
                  className="w-full border border-amber-200/50 shadow-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-[#AD3A24] focus:border-[#AD3A24] outline-none bg-white/80"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-gray-700">
                  Base Offer Price (Rs.)
                </label>
                <input
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  type="number"
                  placeholder="0"
                  className="w-full border border-amber-200/50 shadow-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-[#AD3A24] focus:border-[#AD3A24] outline-none bg-white/80"
                />
              </div>
            </div>
          )}

          {/* Weight Variants */}
          <div className="border-t border-amber-200/50 pt-5 relative z-10">
            <p className="text-lg font-bold mb-3 text-gray-700 flex items-center gap-2">
              Weight Variants (optional)
            </p>

            {weights.length > 0 && (
              <div className="space-y-2 mb-3">
                {weights.map((w, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white/60 px-4 py-2 rounded-xl border border-amber-200/50"
                  >
                    <div className="flex gap-4 text-sm text-gray-800">
                      <span className="font-medium">{w.weight}</span>
                      <span>Rs.{w.price}</span>
                      <span className="text-[#AD3A24]">Offer: Rs.{w.offerPrice}</span>
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

            {/* Add Weight Form */}
            <div className="grid grid-cols-3 gap-3">
              <input
                value={currentWeight.weight}
                onChange={(e) => setCurrentWeight({ ...currentWeight, weight: e.target.value })}
                type="text"
                placeholder="Weight (e.g. 100g)"
                className="border border-amber-200/50 shadow-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-[#AD3A24] focus:border-[#AD3A24] outline-none bg-white/80"
              />
              <input
                value={currentWeight.price}
                onChange={(e) => setCurrentWeight({ ...currentWeight, price: e.target.value })}
                type="number"
                placeholder="Price"
                className="border border-amber-200/50 shadow-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-[#AD3A24] focus:border-[#AD3A24] outline-none bg-white/80"
              />
              <input
                value={currentWeight.offerPrice}
                onChange={(e) => setCurrentWeight({ ...currentWeight, offerPrice: e.target.value })}
                type="number"
                placeholder="Offer Price"
                className="border border-amber-200/50 shadow-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-[#AD3A24] focus:border-[#AD3A24] outline-none bg-white/80"
              />
            </div>

            <button
              type="button"
              onClick={addWeightVariant}
              className="mt-4 flex items-center justify-center w-full gap-2 bg-[#AD3A24] hover:bg-[#8B2E1A] text-white font-semibold rounded-xl py-2.5 transition-transform hover:scale-[1.02] shadow-md"
            >
              <PlusCircle size={18} /> Add Weight Variant
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || loadingCategories}
            className={`w-full py-3 mt-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-transform relative z-10 ${
              loading || loadingCategories
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#8B2E1A] hover:bg-[#AD3A24] transition-transform hover:scale-[1.02] shadow-md"
            }`}
          >
            {loading && <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>}
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;