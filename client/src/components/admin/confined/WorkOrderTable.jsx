import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


const WorkOrderTable = ({ orders = [], onEdit, onDelete, searchParams = {} }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Function to determine if this row should be highlighted based on search params
  const isHighlighted = (order) => {
    if (!Object.keys(searchParams).length) return false;
    
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && value.trim() !== '') {
        const lowerValue = value.toLowerCase();
        
        if (key === 'uniqueId' && order.uniqueId && order.uniqueId.toLowerCase().includes(lowerValue)) {
          return true;
        }
        
        if (key === 'confinedSpaceNameOrId' && order.confinedSpaceNameOrId && 
            order.confinedSpaceNameOrId.toLowerCase().includes(lowerValue)) {
          return true;
        }
        
        if (key === 'building' && order.building && 
            order.building.toLowerCase().includes(lowerValue)) {
          return true;
        }
      }
    }
    
    return false;
  };  const downloadSinglePDF = async (order) => {
    try {
      const doc = new jsPDF();
      
      // Add company header
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text("CONFINED SPACE ASSESSMENT", 105, 15, { align: "center" });
      
      // Add form header
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text("Form No: CS-" + order._id?.slice(-6) || 'N/A', 14, 25);
      doc.text("Date: " + order.dateOfSurvey?.slice(0, 10) || 'N/A', 14, 30);
      doc.text("Surveyors: " + order.surveyors?.join(", ") || 'N/A', 14, 35);

      // Add a line separator
      doc.setDrawColor(0);
      doc.line(14, 40, 196, 40);

      // Section 1: Location Information
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("1. LOCATION INFORMATION", 14, 50);
      
      let currentY = 55;
      
      const locationInfo = [
        ['Space Name/ID:', order.confinedSpaceNameOrId || 'N/A'],
        ['Building:', order.building || 'N/A'],
        ['Location Description:', order.locationDescription || 'N/A'],
        ['Confined Space Description:', order.confinedSpaceDescription || 'N/A']
      ];

      autoTable(doc, {
        body: locationInfo,
        startY: currentY,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 130 }
        },
        theme: 'grid',
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      // Section 2: Space Classification
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("2. SPACE CLASSIFICATION", 14, currentY);
      currentY += 5;
      
      const spaceClassification = [
        ['Is this a Confined Space:', order.confinedSpace ? '☒ Yes' : '☐ No'],
        ['Permit Required:', order.permitRequired ? '☒ Yes' : '☐ No'],
        ['Entry Requirements:', order.entryRequirements || 'N/A']
      ];

      autoTable(doc, {
        body: spaceClassification,
        startY: currentY + 5,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 130 }
        },
        theme: 'grid',
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      // Section 3: Hazard Assessment
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("3. HAZARD ASSESSMENT", 14, currentY);
      currentY += 5;
      
      const hazardsAssessment = [
        ['Atmospheric Hazard:', order.atmosphericHazard ? '☒ Yes' : '☐ No'],
        ['Description:', order.atmosphericHazardDescription || 'N/A'],
        ['Engulfment Hazard:', order.engulfmentHazard ? '☒ Yes' : '☐ No'],
        ['Description:', order.engulfmentHazardDescription || 'N/A'],
        ['Configuration Hazard:', order.configurationHazard ? '☒ Yes' : '☐ No'],
        ['Description:', order.configurationHazardDescription || 'N/A'],
        ['Other Recognized Hazards:', order.otherRecognizedHazards ? '☒ Yes' : '☐ No'],
        ['Description:', order.otherHazardsDescription || 'N/A']
      ];

      autoTable(doc, {
        body: hazardsAssessment,
        startY: currentY + 5,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 130 }
        },
        theme: 'grid',
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      // Section 4: Safety Measures
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("4. SAFETY MEASURES", 14, currentY);
      currentY += 5;
      
      const safetyMeasures = [
        ['PPE Required:', order.ppeRequired ? '☒ Yes' : '☐ No'],
        ['PPE List:', order.ppeList || 'N/A'],
        ['Forced Air Ventilation:', order.forcedAirVentilationSufficient ? '☒ Sufficient' : '☐ Insufficient'],
        ['Dedicated Air Monitor:', order.dedicatedContinuousAirMonitor ? '☒ Yes' : '☐ No'],
        ['Warning Sign Posted:', order.warningSignPosted ? '☒ Yes' : '☐ No'],
        ['Number of Entry Points:', order.numberOfEntryPoints || 'N/A']
      ];

      autoTable(doc, {
        body: safetyMeasures,
        startY: currentY + 5,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 130 }
        },
        theme: 'grid',
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      // Section 5: Additional Information
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("5. ADDITIONAL INFORMATION", 14, currentY);
      currentY += 5;
      
      const additionalInfo = [
        ['Other People Working Near Space:', order.otherPeopleWorkingNearSpace ? '☒ Yes' : '☐ No'],
        ['Can Others See into Space:', order.canOthersSeeIntoSpace ? '☒ Yes' : '☐ No'],
        ['Do Contractors Enter Space:', order.contractorsEnterSpace ? '☒ Yes' : '☐ No'],
        ['Notes:', order.notes || 'N/A']
      ];

      autoTable(doc, {
        body: additionalInfo,
        startY: currentY + 5,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 130 }
        },
        theme: 'grid',
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });
      // Add images section if available
      const orderImages = order.pictures || order.images || [];
      if (orderImages && orderImages.length > 0) {
        if (currentY > doc.internal.pageSize.getHeight() - 100) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("CONFINED SPACE IMAGES", 14, currentY);
        currentY += 10;

        // Prepare image loading for all images
        const imagePromises = [];
        const imgInfos = [];
        for (let i = 0; i < orderImages.length; i++) {
          const imgPath = orderImages[i];
          const imageUrl = typeof imgPath === 'string'
            ? (imgPath.startsWith('data:') ? imgPath
              : imgPath.startsWith('http') ? imgPath
              : `http://localhost:5002${imgPath.startsWith('/') ? '' : '/'}${imgPath}`)
            : imgPath;
          const promise = new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
              // High quality canvas
              let imgWidth = img.width;
              let imgHeight = img.height;
              const maxWidth = 170;
              const maxHeight = 120;
              if (imgWidth > maxWidth || imgHeight > maxHeight) {
                const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
                imgWidth *= ratio;
                imgHeight *= ratio;
              }
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              // Use 3x for higher resolution
              canvas.width = imgWidth * 3;
              canvas.height = imgHeight * 3;
              canvas.style.width = imgWidth + "px";
              canvas.style.height = imgHeight + "px";
              ctx.scale(3, 3);
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";
              ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
              // Use PNG for lossless quality
              const dataUrl = canvas.toDataURL('image/png', 1.0);
              imgInfos.push({
                dataUrl,
                width: imgWidth,
                height: imgHeight,
                originalPath: imgPath
              });
              resolve();
            };
            img.onerror = () => resolve();
            img.src = imageUrl;
          });
          imagePromises.push(promise);
        }
        await Promise.all(imagePromises);

        // Add images to PDF
        if (imgInfos.length > 0) {
          const marginLeft = 14;
          const pageWidth = doc.internal.pageSize.getWidth();
          let xPos = marginLeft;
          let yPos = currentY;
          const spaceBetweenImages = 10;
          for (let i = 0; i < imgInfos.length; i++) {
            const imgInfo = imgInfos[i];
            // Place each image vertically, one per row
            if (yPos + imgInfo.height > doc.internal.pageSize.getHeight() - 20) {
              doc.addPage();
              yPos = 20;
            }
            try {
              doc.setDrawColor(200, 200, 200);
              doc.setLineWidth(0.5);
              doc.rect(xPos - 2, yPos - 2, imgInfo.width + 4, imgInfo.height + 4);
              doc.addImage(imgInfo.dataUrl, 'PNG', xPos, yPos, imgInfo.width, imgInfo.height);
              doc.setFontSize(9);
              doc.setFont(undefined, 'bold');
              doc.text(`Image ${i+1}`, xPos + imgInfo.width/2, yPos + imgInfo.height + 5, { align: 'center' });
              // Move yPos for next image (vertically)
              yPos += imgInfo.height + spaceBetweenImages + 15;
            } catch (imgError) {
              // skip
            }
          }
          currentY = yPos + 10;
        } else {
          doc.setFontSize(10);
          doc.setFont(undefined, 'italic');
          doc.text("No images available", marginLeft, currentY + 10);
          currentY += 20;
        }
      }

      // Add signature section
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("ASSESSOR SIGNATURE", 14, currentY + 10);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text("Name: " + (order.surveyors?.join(", ") || 'N/A'), 14, currentY + 20);
      doc.text("Date: " + new Date().toLocaleDateString(), 14, currentY + 30);

      // Add footer with page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      doc.save(`confined-space-assessment-${order.confinedSpaceNameOrId || 'report'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };// Handle empty orders array
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No work orders found.</p>
      </div>
    );
  }
  
  // Make sure required props are provided
  const handleEdit = onEdit || (() => {});
  const handleDelete = onDelete || (() => {});

  // Function to highlight matching text in table cells
  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const lowerText = String(text).toLowerCase();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    if (!lowerText.includes(lowerSearchTerm)) return text;
    
    const startIndex = lowerText.indexOf(lowerSearchTerm);
    const endIndex = startIndex + searchTerm.length;
    
    return (
      <>
        {text.substring(0, startIndex)}
        <span className="bg-yellow-200 font-medium">{text.substring(startIndex, endIndex)}</span>
        {text.substring(endIndex)}
      </>
    );
  };
  
  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Survey Date</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Surveyors</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Space Name/ID</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Building</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Permit Required</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order._id} className={`hover:bg-gray-50 transition-colors duration-200 ${isHighlighted(order) ? 'bg-yellow-50' : ''}`}>                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{searchParams?.id ? 
                        highlightMatch(order.uniqueId || order._id?.slice(-4).padStart(4, '0'), searchParams.id) : 
                        (order.uniqueId || order._id?.slice(-4).padStart(4, '0'))}</div>
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.dateOfSurvey?.slice(0,10)}</div>
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 hidden sm:table-cell">
                    <div className="text-sm text-gray-900">{order.surveyors?.join(", ")}</div>
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="text-sm text-gray-900">{order.confinedSpaceNameOrId}</div>
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 hidden md:table-cell">
                    <div className="text-sm text-gray-900">{order.building}</div>
                  </td>
              
                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <span className={`px-3 sm:px-4 py-1 sm:py-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.permitRequired 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {order.permitRequired ? "Required" : "Not Required"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2 sm:space-x-4">
                      <button
                        onClick={() => downloadSinglePDF(order)}
                        className="p-1.5 sm:p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        title="Download PDF"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>                      {/* Remove or disable Edit button for admin */}
                      {/* <button
                        onClick={() => handleEdit(order)}
                        className="p-1.5 sm:p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        title="Edit"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button> */}
                      <button
                        onClick={() => handleDelete(order._id)}
                        className="p-1.5 sm:p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full mx-4">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-auto rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default WorkOrderTable;