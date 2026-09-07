import React, { useState } from 'react';
import { Download, FileText, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PriceListGenerator = ({ products, categories, currency }) => {
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

      categoryData[categoryName].products.push(product);

      if (product.weights && Array.isArray(product.weights) && product.weights.length > 0) {
        product.weights.forEach(weightObj => {
          if (weightObj.weight) {
            categoryData[categoryName].weightsSet.add(weightObj.weight);
          }
        });
      }
    });

    const organizedData = {};
    Object.keys(categoryData).forEach(catName => {
      organizedData[catName] = {
        products: categoryData[catName].products,
        weights: Array.from(categoryData[catName].weightsSet).sort((a, b) => {
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
      const doc = new jsPDF('l', 'mm', 'a4');
      
      let yPosition = 20;
      const pageHeight = 190;

      doc.setFontSize(20);
      doc.setTextColor(235, 138, 20);
      doc.text('Price List', 148, yPosition, { align: 'center' });
      yPosition += 15;

      const categoryEntries = Object.entries(categoryData);

      categoryEntries.forEach(([categoryName, data], categoryIndex) => {
        const { products, weights } = data;

        if (categoryIndex > 0) {
          yPosition += 10;
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
        }

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(categoryName, 14, yPosition);
        yPosition += 7;

        const tableData = products.map(product => {
          const row = [product.name];
          
          if (weights.length > 0) {
            weights.forEach(weight => {
              const weightData = product.weights?.find(w => w.weight === weight);
              row.push(weightData ? `${currency}${weightData.offerPrice}` : '-');
            });
          } else {
            row.push(`${currency}${product.offerPrice || 0}`);
          }
          
          return row;
        });

        const headers = ['Product', ...(weights.length > 0 ? weights : ['Price'])];

        autoTable(doc, {
          startY: yPosition,
          head: [headers],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [235, 138, 20],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left'
          },
          bodyStyles: {
            fontSize: 9
          },
          columnStyles: {
            0: { halign: 'left' },
            ...Object.fromEntries(
              Array.from({ length: weights.length }, (_, i) => [i + 1, { halign: 'center' }])
            )
          },
          alternateRowStyles: {
            fillColor: [191, 217, 189]
          },
          margin: { left: 14, right: 14 }
        });

        yPosition = doc.lastAutoTable.finalY + 5;
      });

      doc.save('price-list.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('PDF generation failed: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white rounded-lg transition font-semibold text-xs sm:text-sm shadow-md whitespace-nowrap"
        style={{ backgroundColor: '#EB8A14' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d67a0f'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EB8A14'}
      >
        <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="hidden sm:inline">Generate Price List</span>
        <span className="sm:hidden">Price List</span>
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '1152px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            border: '4px solid #EB8A14'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderBottom: '2px solid #EB8A14'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#000000',
                margin: 0
              }}>Price List Preview</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '24px',
              backgroundColor: '#f9f9f9'
            }}>
              <div
                id="price-list-content"
                style={{ 
                  backgroundColor: '#ffffff',
                  padding: '32px'
                }}
              >
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '32px',
                  color: '#EB8A14'
                }}>
                  Price List
                </h1>

                {Object.entries(categoryData).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <p style={{ color: '#6b7280' }}>No products available</p>
                  </div>
                ) : (
                  Object.entries(categoryData).map(([categoryName, data], idx) => {
                    const { products, weights } = data;
                    
                    return (
                      <div key={idx} style={{ marginBottom: '32px' }}>
                        <h2 style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          marginBottom: '16px',
                          color: '#000000'
                        }}>
                          {categoryName}
                        </h2>
                        
                        <div style={{ overflowX: 'auto' }}>
                          <table 
                            style={{ 
                              width: '100%', 
                              border: '2px solid #EB8A14',
                              borderCollapse: 'collapse'
                            }}
                          >
                            <thead>
                              <tr style={{ backgroundColor: '#EB8A14' }}>
                                <th 
                                  style={{ 
                                    border: '2px solid #EB8A14',
                                    padding: '8px 16px',
                                    textAlign: 'left',
                                    color: '#ffffff',
                                    fontWeight: 600
                                  }}
                                >
                                  Product
                                </th>
                                {weights.length > 0 ? (
                                  weights.map((weight, i) => (
                                    <th 
                                      key={i}
                                      style={{ 
                                        border: '2px solid #EB8A14',
                                        padding: '8px 16px',
                                        textAlign: 'center',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {weight}
                                    </th>
                                  ))
                                ) : (
                                  <th 
                                    style={{ 
                                      border: '2px solid #EB8A14',
                                      padding: '8px 16px',
                                      textAlign: 'center',
                                      color: '#ffffff',
                                      fontWeight: 600
                                    }}
                                  >
                                    Price
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {products.map((product, pIdx) => (
                                <tr
                                  key={product._id || pIdx}
                                  style={{ 
                                    backgroundColor: pIdx % 2 === 0 ? '#ffffff' : '#bfd9bd'
                                  }}
                                >
                                  <td 
                                    style={{ 
                                      border: '2px solid #EB8A14',
                                      padding: '8px 16px',
                                      color: '#000000'
                                    }}
                                  >
                                    {product.name}
                                  </td>
                                  {weights.length > 0 ? (
                                    weights.map((weight, wIdx) => {
                                      const weightData = product.weights?.find(w => w.weight === weight);
                                      return (
                                        <td
                                          key={wIdx}
                                          style={{ 
                                            border: '2px solid #EB8A14',
                                            padding: '8px 16px',
                                            textAlign: 'center',
                                            color: '#000000',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          {weightData ? `${currency}${weightData.offerPrice}` : '-'}
                                        </td>
                                      );
                                    })
                                  ) : (
                                    <td 
                                      style={{ 
                                        border: '2px solid #EB8A14',
                                        padding: '8px 16px',
                                        textAlign: 'center',
                                        color: '#000000',
                                        fontWeight: 600
                                      }}
                                    >
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

            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px',
              borderTop: '2px solid #EB8A14',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={downloadAsPDF}
                disabled={isGenerating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: isGenerating ? '#d1d5db' : '#EB8A14',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: isGenerating ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isGenerating) e.currentTarget.style.backgroundColor = '#d67a0f';
                }}
                onMouseLeave={(e) => {
                  if (!isGenerating) e.currentTarget.style.backgroundColor = '#EB8A14';
                }}
              >
                {isGenerating ? (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <Download size={18} />
                )}
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default PriceListGenerator;