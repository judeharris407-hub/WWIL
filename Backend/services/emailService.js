/**
 * ==============================================================================
 * TransGlobe-Logistics
 * Transactional Email Notification Service (/services/emailService.js)
 * ==============================================================================
 * Dispatches responsive HTML transactional emails via the Resend API.
 */

const { Resend } = require('resend');
require('dotenv').config();

// Initialize Resend Client
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Default sender address: Use onboarding@resend.dev for test sandboxes, or custom verified domain
const SENDER_EMAIL = process.env.EMAIL_FROM || 'TransGlobe-Logistics <onboarding@resend.dev>';
const SUPPORT_TEAM_EMAIL = process.env.SUPPORT_ALERT_EMAIL || 'support@transglobe-logistics.com';

/**
 * Generate modern HTML email template for Freight Quotation Confirmation
 */
function buildQuoteConfirmationHtml(quote) {
  const {
    reference_number,
    freight_type,
    departure_country,
    recipient_country,
    weight,
    full_name,
    email,
    phone,
  } = quote;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TransGlobe-Logistics Quotation Request Confirmation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      color: #1E293B;
    }
    .container {
      max-width: 620px;
      margin: 32px auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #0F172A;
      color: #FFFFFF;
      padding: 36px 32px;
      text-align: left;
      border-bottom: 3px solid #FF6200;
    }
    .brand-logo {
      display: inline-block;
      background: linear-gradient(135deg, #FF6200, #E05600);
      color: #FFFFFF;
      font-weight: 900;
      font-size: 20px;
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
      color: #FFFFFF;
    }
    .brand-sub {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #94A3B8;
      margin-top: 4px;
    }
    .content {
      padding: 36px 32px;
    }
    .reference-box {
      background-color: #FFF7ED;
      border: 1px solid #FFEDD5;
      border-left: 4px solid #FF6200;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 24px 0;
    }
    .reference-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
      color: #C2410C;
    }
    .reference-id {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      margin-top: 4px;
    }
    .table-container {
      margin: 28px 0;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th, td {
      padding: 12px 18px;
      text-align: left;
    }
    th {
      background-color: #F8FAFC;
      color: #64748B;
      font-weight: 600;
      border-bottom: 1px solid #E2E8F0;
      width: 38%;
    }
    td {
      color: #0F172A;
      font-weight: 600;
      border-bottom: 1px solid #F1F5F9;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .next-steps {
      background-color: #F8FAFC;
      border-radius: 10px;
      padding: 20px;
      margin-top: 24px;
      border: 1px solid #E2E8F0;
    }
    .next-steps h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .next-steps p {
      margin: 0;
      font-size: 13px;
      color: #475569;
      line-height: 1.5;
    }
    .footer {
      background-color: #0F172A;
      color: #94A3B8;
      padding: 24px 32px;
      font-size: 12px;
      line-height: 1.6;
      border-top: 1px solid #1E293B;
      text-align: center;
    }
    .footer strong {
      color: #FFFFFF;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-logo">TGL</div>
      <h1 class="brand-title">Quotation Inquiry Registered</h1>
      <div class="brand-sub">TransGlobe-Logistics</div>
    </div>
    
    <div class="content">
      <p style="font-size: 15px; line-height: 1.5; margin-top: 0;">
        Dear <strong>${full_name}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Thank you for contacting TransGlobe-Logistics. We have received your freight quotation request and our global dispatch operations desk has assigned a dedicated tariff specialist to analyze your transit corridor.
      </p>

      <div class="reference-box">
        <div class="reference-label">Quotation Reference Number</div>
        <div class="reference-id">${reference_number}</div>
      </div>

      <div class="table-container">
        <table>
          <tr>
            <th>Freight Solution</th>
            <td>${freight_type}</td>
          </tr>
          <tr>
            <th>Origin (Departure)</th>
            <td>${departure_country}</td>
          </tr>
          <tr>
            <th>Destination (Recipient)</th>
            <td>${recipient_country}</td>
          </tr>
          <tr>
            <th>Estimated Weight</th>
            <td>${weight || 'Standard Freight Consignment'}</td>
          </tr>
          <tr>
            <th>Contact Email</th>
            <td>${email}</td>
          </tr>
          <tr>
            <th>Contact Phone</th>
            <td>${phone || 'Not provided'}</td>
          </tr>
        </table>
      </div>

      <div class="next-steps">
        <h4>What Happens Next?</h4>
        <p>
          Our logistics analysts will evaluate active maritime, air cargo, and land freight corridors for optimal speed and cost efficiency. You will receive an official, itemized commercial invoice quotation via email within <strong>2 to 4 business hours</strong>.
        </p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;">
        <strong>TransGlobe-Logistics Global Dispatch</strong>
      </p>
      <p style="margin: 0 0 6px 0;">
        24/7 Operations Hotline: +1 (800) 845-TGL &bull; operations@transglobe-logistics.com
      </p>
      <p style="margin: 0; font-size: 11px; color: #64748B;">
        This is an automated operational notification. Consignment manifests and quotations are processed under IATA, IMO, and ISO 9001:2015 international standards.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate internal alert email HTML for WWIL Operations Team
 */
function buildOperationsAlertHtml(quote) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: monospace, sans-serif; font-size: 13px; line-height: 1.5; color: #1E293B; background: #F8FAFC; }
    .card { max-width: 600px; margin: 20px auto; background: white; padding: 24px; border-radius: 8px; border: 1px solid #CBD5E1; }
    .badge { display: inline-block; background: #FF6200; color: white; padding: 4px 8px; font-weight: bold; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">NEW INBOUND QUOTE ALERT</div>
    <h2>Reference: ${quote.reference_number}</h2>
    <p>A new quotation inquiry has been received through the TransGlobe-Logistics public portal:</p>
    <ul>
      <li><strong>Client:</strong> ${quote.full_name} (${quote.email} / ${quote.phone || 'N/A'})</li>
      <li><strong>Mode:</strong> ${quote.freight_type}</li>
      <li><strong>Origin:</strong> ${quote.departure_country}</li>
      <li><strong>Destination:</strong> ${quote.recipient_country}</li>
      <li><strong>Weight:</strong> ${quote.weight || 'Unspecified'}</li>
      <li><strong>Logged At:</strong> ${new Date().toISOString()}</li>
    </ul>
    <p>Please review carrier rates and issue formal quotation within SLA (4 hours).</p>
  </div>
</body>
</html>
  `;
}

/**
 * 1. Send Quotation Confirmation Email to the Client
 * @param {Object} quote - Quotation record
 * @returns {Promise<{success: boolean, data?: Object, error?: string, simulated?: boolean}>}
 */
async function sendQuoteConfirmationEmail(quote) {
  if (!quote || !quote.email) {
    return { success: false, error: 'Recipient email is required for quote confirmation.' };
  }

  // Fallback if RESEND_API_KEY is not configured
  if (!resend) {
    console.log(`ℹ️ [EmailService (Simulation)] Resend API key not set. Simulated quote confirmation to ${quote.email}:`);
    console.log(`   Quotation Ref: ${quote.reference_number} | Freight: ${quote.freight_type}`);
    return {
      success: true,
      simulated: true,
      message: 'Simulated email dispatch (RESEND_API_KEY not configured).',
    };
  }

  try {
    const htmlContent = buildQuoteConfirmationHtml(quote);

    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [quote.email],
      subject: `TransGlobe-Logistics Freight Quotation Confirmation - ${quote.reference_number}`,
      html: htmlContent,
    });

    console.log(`✅ [EmailService] Confirmation email dispatched to ${quote.email} (ID: ${result.data?.id || 'OK'})`);
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`❌ [EmailService Error] Failed to dispatch email to ${quote.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Send Operations Team Alert for Inbound Quotations or Consignments
 * @param {Object} quote - Quotation record
 * @returns {Promise<{success: boolean, data?: Object, error?: string, simulated?: boolean}>}
 */
async function sendOperationsAlertEmail(quote) {
  if (!resend) {
    console.log(`ℹ️ [EmailService (Simulation)] Operations alert simulated for ${SUPPORT_TEAM_EMAIL}`);
    return { success: true, simulated: true };
  }

  try {
    const htmlContent = buildOperationsAlertHtml(quote);

    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [SUPPORT_TEAM_EMAIL],
      subject: `[DISPATCH ALERT] New Quote Request: ${quote.reference_number} (${quote.departure_country} -> ${quote.recipient_country})`,
      html: htmlContent,
    });

    console.log(`✅ [EmailService] Operations alert sent to ${SUPPORT_TEAM_EMAIL}`);
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`❌ [EmailService Error] Failed to send operations alert:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendQuoteConfirmationEmail,
  sendOperationsAlertEmail,
};
