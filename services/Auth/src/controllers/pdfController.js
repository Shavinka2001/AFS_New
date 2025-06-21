const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const generateUserReport = async (req, res) => {
    try {
        // Create a new PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            bufferPages: true
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=user-management-report.pdf');

        // Pipe the PDF directly to the response
        doc.pipe(res);

        // Add company logo (if you have one)
        // doc.image('path/to/logo.png', 50, 45, { width: 50 });

        // Add title
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#1E40AF')
           .text('User Management Report', { align: 'center' });

        // Add date
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#6B7280')
           .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

        // Add some space
        doc.moveDown(2);

        // Get users from database
        const users = await User.find({});

        // Add statistics
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#111827')
           .text('Statistics', { align: 'left' });

        doc.moveDown(0.5);

        // Create statistics boxes
        const totalUsers = users.length;
        const activeUsers = users.filter(user => user.isActive).length;

        // Draw statistics boxes
        doc.rect(50, doc.y, 250, 60)
           .fillColor('#EBF5FF')
           .fill()
           .fillColor('#1E40AF')
           .fontSize(12)
           .text('Total Users', 70, doc.y + 20)
           .fontSize(24)
           .text(totalUsers.toString(), 70, doc.y + 40);

        doc.rect(320, doc.y - 60, 250, 60)
           .fillColor('#ECFDF5')
           .fill()
           .fillColor('#065F46')
           .fontSize(12)
           .text('Active Users', 340, doc.y - 40)
           .fontSize(24)
           .text(activeUsers.toString(), 340, doc.y - 20);

        doc.moveDown(3);

        // Add table headers
        const tableTop = doc.y;
        const tableHeaders = ['User', 'Contact', 'Role', 'Status'];
        const columnWidths = [150, 150, 100, 100];
        let currentX = 50;

        // Draw table headers
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#6B7280');

        tableHeaders.forEach((header, i) => {
            doc.text(header, currentX, tableTop);
            currentX += columnWidths[i];
        });

        // Draw table rows
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#111827');

        let currentY = tableTop + 20;

        users.forEach((user, index) => {
            if (currentY > 700) { // Check if we need a new page
                doc.addPage();
                currentY = 50;
            }

            // User name and ID
            doc.text(`${user.firstname} ${user.lastname}`, 50, currentY);
            doc.fontSize(8)
               .fillColor('#6B7280')
               .text(`ID: ${user._id.slice(-6)}`, 50, currentY + 15);

            // Contact
            doc.fontSize(10)
               .fillColor('#111827')
               .text(user.email, 200, currentY);
            doc.fontSize(8)
               .fillColor('#6B7280')
               .text(user.phone || 'No phone', 200, currentY + 15);

            // Role
            doc.fontSize(10)
               .fillColor('#111827')
               .text(user.userType === 'admin' ? 'Administrator' : 'Regular User', 350, currentY);

            // Status
            const statusColor = user.isActive ? '#065F46' : '#991B1B';
            doc.fillColor(statusColor)
               .text(user.isActive ? 'Active' : 'Inactive', 450, currentY);

            currentY += 40;
        });

        // Add footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(8)
               .fillColor('#6B7280')
               .text(
                   `Page ${i + 1} of ${pageCount}`,
                   50,
                   doc.page.height - 50,
                   { align: 'center' }
               );
            doc.text(
                `© ${new Date().getFullYear()} Your Company Name. All rights reserved.`,
                50,
                doc.page.height - 35,
                { align: 'center' }
            );
        }

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Error generating PDF report' });
    }
};

module.exports = {
    generateUserReport
}; 