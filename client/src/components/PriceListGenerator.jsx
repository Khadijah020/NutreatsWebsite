import React, { useState, useRef } from 'react';
import { Download, FileText, ImageIcon, X } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

const PriceListGenerator = ({ products, categories, currency }) => {
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const priceListRef = useRef(null);

  // Organize products by category with category-specific weights ONLY
  const organizeProductsByCategory = () => {
    const categoryData = {};

    products.forEach(product => {
      const categoryName = product.category || 'Uncategorized';
      
      if (!categoryData[categoryName]) {
        categoryData[categoryName] = {
          products: [],
          weightsSet: new Set()
        };
      }

      // Add product to category
      categoryData[categoryName].products.push(product);

      // Collect ONLY the weights that exist in THIS CATEGORY's products
      if (product.weights && Array.isArray(product.weights) && product.weights.length > 0) {
        product.weights.forEach(weightObj => {
          if (weightObj.weight) {
            categoryData[categoryName].weightsSet.add(weightObj.weight);
          }
        });
      }
    });

    // Convert Sets to sorted arrays for each category
    const organizedData = {};
    Object.keys(categoryData).forEach(catName => {
      organizedData[catName] = {
        products: categoryData[catName].products,
        weights: Array.from(categoryData[catName].weightsSet).sort((a, b) => {
          // Try to sort numerically if possible
          const numA = parseFloat(a);
          const numB = parseFloat(b);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          return a.localeCompare(b);
        })
      };
    });

    return organizedData;
  };

  const categoryData = organizeProductsByCategory();

  const downloadAsPDF = async () => {
  setIsGenerating(true);

  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape

    // Title
    doc.setFontSize(20);
    doc.setTextColor(235, 138, 20);
    doc.text('Price List', 148, 15, { align: 'center' });

    let categoryIndex = 0;

    Object.entries(categoryData).forEach(([categoryName, data]) => {
      const { products, weights } = data;

      // Start a NEW PAGE for every category EXCEPT the first
      if (categoryIndex > 0) {
        doc.addPage();
      }

      // Category Header
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(categoryName, 14, 28);

      // Prepare category-specific data
      const headers = ['Product', ...(weights.length > 0 ? weights : ['Price'])];

      const tableData = products.map(product => {
        const row = [product.name];

        if (weights.length > 0) {
          weights.forEach(weight => {
            const wObj = product.weights?.find(w => w.weight === weight);
            row.push(wObj ? `${currency}${wObj.offerPrice}` : '-');
          });
        } else {
          row.push(`${currency}${product.offerPrice || 0}`);
        }

        return row;
      });

      // Create category table on same page
      doc.autoTable({
        startY: 35,
        head: [headers],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [235, 138, 20],
          textColor: [255, 255, 255],
          fontSize: 10
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: {
          fillColor: [191, 217, 189]
        },
        columnStyles: {
          0: { halign: 'left' },
          ...Object.fromEntries(
            (weights.length > 0
              ? weights
              : ['Price']
            ).map((_, i) => [i + 1, { halign: 'center' }])
          )
        },
        margin: { left: 14, right: 14 }
      });

      categoryIndex++;
    });

    doc.save('price-list.pdf');
  } catch (error) {
    console.error(error);
    alert('PDF generation failed: ' + error.message);
  } finally {
    setIsGenerating(false);
  }
};

  const downloadAsImage = async () => {
    setIsGenerating(true);
    try {
      if (priceListRef.current) {
        const canvas = await html2canvas(priceListRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        
        const link = document.createElement('a');
        link.download = 'price-list.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Error: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Generate Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#EB8A14] text-white rounded-lg hover:bg-[#d67a0f] transition font-semibold text-xs sm:text-sm shadow-md whitespace-nowrap"
      >
        <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="hidden sm:inline">Generate Price List</span>
        <span className="sm:hidden">Price List</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border-4 border-[#EB8A14]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-[#EB8A14]">
              <h3 className="text-lg sm:text-xl font-bold text-black">Price List Preview</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              <div ref={priceListRef} className="bg-white p-6 sm:p-8">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8" style={{ color: '#EB8A14' }}>
                  Price List
                </h1>

                {/* Categories with their specific weight columns */}
                {Object.entries(categoryData).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No products available</p>
                  </div>
                ) : (
                  Object.entries(categoryData).map(([categoryName, data], idx) => {
                    const { products, weights } = data;
                    
                    return (
                      <div key={idx} className="mb-6 sm:mb-8 break-inside-avoid">
                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-black">
                          {categoryName}
                        </h2>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full border-2 border-[#EB8A14] min-w-max">
                            <thead>
                              <tr style={{ backgroundColor: '#EB8A14' }}>
                                <th className="border-2 border-[#EB8A14] px-3 sm:px-4 py-2 text-left text-white font-semibold text-sm sm:text-base">
                                  Product
                                </th>
                                {weights.length > 0 ? (
                                  weights.map((weight, i) => (
                                    <th 
                                      key={i} 
                                      className="border-2 border-[#EB8A14] px-3 sm:px-4 py-2 text-center text-white font-semibold text-sm sm:text-base whitespace-nowrap"
                                    >
                                      {weight}
                                    </th>
                                  ))
                                ) : (
                                  <th className="border-2 border-[#EB8A14] px-3 sm:px-4 py-2 text-center text-white font-semibold text-sm sm:text-base">
                                    Price
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {products.map((product, pIdx) => (
                                <tr
                                  key={product._id || pIdx}
                                  className={pIdx % 2 === 0 ? 'bg-white' : 'bg-[#bfd9bde0]'}
                                >
                                  <td className="border-2 border-[#EB8A14] px-3 sm:px-4 py-2 text-black text-sm sm:text-base">
                                    {product.name}
                                  </td>
                                  {weights.length > 0 ? (
                                    weights.map((weight, wIdx) => {
                                      const weightData = product.weights?.find(w => w.weight === weight);
                                      return (
                                        <td
                                          key={wIdx}
                                          className="border-2 border-[#EB8A14] px-3 sm:px-4 py-2 text-center text-black font-semibold text-sm sm:text-base whitespace-nowrap"
                                        >
                                          {weightData ? `${currency}${weightData.offerPrice}` : '-'}
                                        </td>
                                      );
                                    })
                                  ) : (
                                    <td className="border-2 border-[#EB8A14] px-3 sm:px-4 py-2 text-center text-black font-semibold text-sm sm:text-base">
                                      {currency}{product.offerPrice || 0}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 border-t-2 border-[#EB8A14]">
              <button
                onClick={downloadAsPDF}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#EB8A14] text-white rounded-lg hover:bg-[#d67a0f] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                Download PDF
              </button>
              
              <button
                onClick={downloadAsImage}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ImageIcon size={18} />
                )}
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PriceListGenerator;