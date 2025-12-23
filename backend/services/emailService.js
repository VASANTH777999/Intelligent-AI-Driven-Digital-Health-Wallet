const nodemailer = require('nodemailer');

// Create email transporter (using Gmail as example)
// For production, use environment variables for credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with your email
        pass: process.env.EMAIL_PASS || 'your-app-password'      // Replace with app password
    }
});

/**
 * Send access granted notification email
 */
async function sendAccessGrantedEmail(recipientEmail, recipientName, ownerName, reportName, reportType) {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'Digital Health Wallet <noreply@healthwallet.com>',
        to: recipientEmail,
        subject: `${ownerName} shared a health report with you`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .report-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Health Report Shared</h1>
          </div>
          <div class="content">
            <h2>Hello ${recipientName},</h2>
            <p><strong>${ownerName}</strong> has granted you access to view their health report.</p>
            
            <div class="report-info">
              <h3>Report Details:</h3>
              <p><strong>Report Name:</strong> ${reportName}</p>
              <p><strong>Report Type:</strong> ${reportType}</p>
              <p><strong>Shared by:</strong> ${ownerName}</p>
            </div>
            
            <p>You can now view this report in your Digital Health Wallet dashboard.</p>
            
            <a href="http://localhost:5000/sharing" class="button">View Shared Reports</a>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              <strong>Note:</strong> This access allows you to view the report. Please handle this medical information with care and confidentiality.
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from Digital Health Wallet</p>
            <p>© 2025 Digital Health Wallet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Access notification email sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error - email is optional, access should still be granted
        return false;
    }
}

/**
 * Send access revoked notification email
 */
async function sendAccessRevokedEmail(recipientEmail, recipientName, ownerName, reportName) {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'Digital Health Wallet <noreply@healthwallet.com>',
        to: recipientEmail,
        subject: `Access to health report has been revoked`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Access Revoked</h1>
          </div>
          <div class="content">
            <h2>Hello ${recipientName},</h2>
            <p><strong>${ownerName}</strong> has revoked your access to their health report: <strong>${reportName}</strong></p>
            <p>You will no longer be able to view this report in your dashboard.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from Digital Health Wallet</p>
            <p>© 2025 Digital Health Wallet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Access revoked email sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

module.exports = {
    sendAccessGrantedEmail,
    sendAccessRevokedEmail
};
