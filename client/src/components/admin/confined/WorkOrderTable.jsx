import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const WorkOrderTable = ({ orders, onEdit, onDelete }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const downloadSinglePDF = (order) => {
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
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      const locationInfo = [
        ['Space Name/ID:', order.confinedSpaceNameOrId || 'N/A'],
        ['Building:', order.building || 'N/A'],
        ['Location Description:', order.locationDescription || 'N/A'],
        ['Confined Space Description:', order.confinedSpaceDescription || 'N/A']
      ];

      autoTable(doc, {
        body: locationInfo,
        startY: 55,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 130 }
        },
        theme: 'grid'
      });

      // Section 2: Space Classification
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("2. SPACE CLASSIFICATION", 14, doc.lastAutoTable.finalY + 10);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      const spaceClassification = [
        ['Is this a Confined Space:', order.confinedSpace ? '☒ Yes' : '☐ No'],
        ['Permit Required:', order.permitRequired ? '☒ Yes' : '☐ No'],
        ['Entry Requirements:', order.entryRequirements || 'N/A']
      ];

      autoTable(doc, {
        body: spaceClassification,
        startY: doc.lastAutoTable.finalY + 15,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 130 }
        },
        theme: 'grid'
      });

      // Section 3: Hazard Assessment
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("3. HAZARD ASSESSMENT", 14, doc.lastAutoTable.finalY + 10);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

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
        startY: doc.lastAutoTable.finalY + 15,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 130 }
        },
        theme: 'grid'
      });

      // Section 4: Safety Measures
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("4. SAFETY MEASURES", 14, doc.lastAutoTable.finalY + 10);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

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
        startY: doc.lastAutoTable.finalY + 15,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 130 }
        },
        theme: 'grid'
      });

      // Section 5: Additional Information
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("5. ADDITIONAL INFORMATION", 14, doc.lastAutoTable.finalY + 10);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      const additionalInfo = [
        ['Other People Working Near Space:', order.otherPeopleWorkingNearSpace ? '☒ Yes' : '☐ No'],
        ['Can Others See into Space:', order.canOthersSeeIntoSpace ? '☒ Yes' : '☐ No'],
        ['Do Contractors Enter Space:', order.contractorsEnterSpace ? '☒ Yes' : '☐ No'],
        ['Notes:', order.notes || 'N/A']
      ];

      autoTable(doc, {
        body: additionalInfo,
        startY: doc.lastAutoTable.finalY + 15,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 130 }
        },
        theme: 'grid'
      });

      // Add signature section
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("ASSESSOR SIGNATURE", 14, doc.lastAutoTable.finalY + 20);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text("Name: " + order.surveyors?.join(", ") || 'N/A', 14, doc.lastAutoTable.finalY + 25);
      doc.text("Date: " + new Date().toLocaleDateString(), 14, doc.lastAutoTable.finalY + 30);

      // Add footer
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
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Survey Date</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Surveyors</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Space Name/ID</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Building</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Images</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Permit Required</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
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
                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 hidden sm:table-cell">
                    <div className="flex -space-x-2">
                      {order.images?.slice(0, 3).map((image, index) => (
                        <div 
                          key={index}
                          className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white overflow-hidden cursor-pointer hover:z-10 shadow-sm"
                          onClick={() => setSelectedImage(image)}
                        >
                          <img
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {order.images?.length > 3 && (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-900 shadow-sm">
                          +{order.images.length - 3}
                        </div>
                      )}
                    </div>
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
                      </button>
                      <button
                        onClick={() => onEdit(order)}
                        className="p-1.5 sm:p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        title="Edit"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(order._id)}
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
          className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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