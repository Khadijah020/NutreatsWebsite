import React, { useState } from "react";
import { assets, categories } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { PlusCircle, X, Upload } from "lucide-react";

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const { axios } = useAppContext();
  const [loading, setLoading] = useState(false);

  const [weights, setWeights] = useState([]);
  const [currentWeight, setCurrentWeight] = useState({
    weight: "",
    price: "",
    offerPrice: "",
  });

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

    try {
      setLoading(true);
      const productData = {
        name,
        description: description.split("\n"),
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
    <div className="min-h-screen bg-[#e6dbcee0] flex justify-center items-start py-8 md:py-12 overflow-y-auto">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-6xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 md:p-12 space-y-6 border border-gray-200"
      >
        <h2 className="text-3xl font-semibold text-center bg-gradient-to-r from-emerald-600 to-green-400 bg-clip-text text-transparent">
          Add New Product
        </h2>

        {/* Upload Images */}
        <div>
          <p className="text-base font-medium mb-2 text-gray-700">Product Images</p>
          <div className="flex flex-wrap gap-4">
            {files.map((file, index) => (
              <label
                key={index}
                className="relative cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl w-28 h-28 flex items-center justify-center hover:border-emerald-400 transition-all hover:scale-105 hover:bg-emerald-50/50"
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
                  <Upload className="text-emerald-400 w-8 h-8" />
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

            {/* Add new image button */}
            <button
              type="button"
              onClick={() => setFiles([...files, null])}
              className="border-2 border-dashed border-gray-300 rounded-2xl w-28 h-28 flex items-center justify-center hover:border-emerald-400 transition-all hover:scale-105 hover:bg-emerald-50/50"
            >
              <PlusCircle className="text-emerald-400 w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <label className="font-medium block mb-1 text-gray-700">
              Product Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              type="text"
              placeholder="e.g. Classic Subway Sandwich"
              className="w-full border border-gray-300 shadow-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 outline-none bg-gray-50"
            />
          </div>

          <div>
            <label className="font-medium block mb-1 text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe your product..."
              className="w-full border border-gray-300 shadow-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 outline-none resize-none bg-gray-50"
            />
          </div>

          <div>
            <label className="font-medium block mb-1 text-gray-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 shadow-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 outline-none bg-gray-50"
            >
              <option value="">Select Category</option>
              {categories.map((item, index) => (
                <option key={index} value={item.path}>
                  {item.path}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Base Price */}
        {!weights.length && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium block mb-1 text-gray-700">
                Base Price (Rs.)
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                placeholder="0"
                className="w-full border border-gray-300 shadow-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 outline-none bg-gray-50"
              />
            </div>
            <div>
              <label className="font-medium block mb-1 text-gray-700">
                Base Offer Price (Rs.)
              </label>
              <input
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                type="number"
                placeholder="0"
                className="w-full border border-gray-300 shadow-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 outline-none bg-gray-50"
              />
            </div>
          </div>
        )}

        {/* Weight Variants */}
        <div className="border-t pt-5">
          <p className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
            Weight Variants (optional)
          </p>

          {weights.length > 0 && (
            <div className="space-y-2 mb-3">
              {weights.map((w, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200"
                >
                  <div className="flex gap-4 text-sm text-emerald-900">
                    <span className="font-medium">{w.weight}</span>
                    <span>Rs.{w.price}</span>
                    <span className="text-emerald-600">Offer: Rs.{w.offerPrice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeWeightVariant(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
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
              className="border border-gray-300 shadow-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 outline-none bg-gray-50"
            />
            <input
              value={currentWeight.price}
              onChange={(e) => setCurrentWeight({ ...currentWeight, price: e.target.value })}
              type="number"
              placeholder="Price"
              className="border border-gray-300 shadow-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 outline-none bg-gray-50"
            />
            <input
              value={currentWeight.offerPrice}
              onChange={(e) => setCurrentWeight({ ...currentWeight, offerPrice: e.target.value })}
              type="number"
              placeholder="Offer Price"
              className="border border-gray-300 shadow-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 outline-none bg-gray-50"
            />
          </div>

          <button
            type="button"
            onClick={addWeightVariant}
            className="mt-4 flex items-center justify-center w-full gap-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl py-2.5 transition-transform hover:scale-[1.02]"
          >
            <PlusCircle size={18} /> Add Weight Variant
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 mt-6 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-transform ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800 transition-transform hover:scale-[1.02]"
          }`}
        >
          {loading && <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>}
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
