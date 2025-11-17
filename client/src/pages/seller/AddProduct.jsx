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
  const [isFeatured, setIsFeatured] = useState(false); // ✅ NEW: Featured toggle
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
        isFeatured, // ✅ Include featured status
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
        setIsFeatured(false); // ✅ Reset featured status
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#bfd9bde0] flex justify-center items-start py-8 md:py-12 overflow-y-auto">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-6xl mx-auto bg-white rounded-2xl border-4 border-[#EB8A14] overflow-hidden"
      >
        <div className="p-8 md:p-12 space-y-6">
          <h2 className="text-3xl font-bold text-center text-black">
            Add New Product
          </h2>

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
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 border-2 border-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </label>
              ))}

              <button
                type="button"
                onClick={() => setFiles([...files, null])}
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
              {!loadingCategories && categories.length === 0 && (
                <p className="text-sm text-[#EB8A14] mt-1">
                  No categories available. Please add categories first.
                </p>
              )}
            </div>
          </div>

          {/* Base Price */}
          {!weights.length && (
            <div className="grid grid-cols-2 gap-4">
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

          {/* Weight Variants */}
          <div className="border-t-2 border-[#EB8A14] pt-5">
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

            {/* Add Weight Form */}
            <div className="grid grid-cols-3 gap-3">
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
              className="mt-4 flex items-center justify-center w-full gap-2 bg-[#EB8A14] hover:bg-orange-600 text-white font-semibold rounded-xl py-2.5 transition-transform hover:scale-[1.02] shadow-md border-2 border-[#EB8A14]"
            >
              <PlusCircle size={18} /> Add Weight Variant
            </button>
          </div>

          {/* ✅ FEATURED TOGGLE */}
          <div className="flex items-center gap-3 border-t-2 border-[#EB8A14] pt-6">
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
            <span className="text-sm text-gray-600">
              (Featured products appear on the homepage)
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || loadingCategories}
            className={`w-full py-3 mt-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-transform ${
              loading || loadingCategories
                ? "bg-gray-400 cursor-not-allowed border-2 border-gray-400"
                : "bg-[#EB8A14] hover:bg-orange-600 transition-transform hover:scale-[1.02] shadow-md border-2 border-[#EB8A14]"
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