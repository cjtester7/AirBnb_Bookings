// netlify/functions/cancel-v1.js
// Handles guest booking cancellation requests
// Version: v1

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby48XIE2VCFwkIEEqlKz_dSUShg5D_zT1VB1i-tnlt0mXNg-uyA6cam71sc1VaMSHGBxA/exec";

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const uuid = params.uuid;

  if (!uuid) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: errorPage("Invalid cancellation link. Please contact us at admin@casaserena.com")
    };
  }

  try {
    const url = APPS_SCRIPT_URL + "?action=cancelBooking&uuid=" + encodeURIComponent(uuid);
    const response = await fetch(url, { method: "GET", redirect: "follow" });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { success: false, error: text }; }

    if (data.success) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: successPage(uuid)
      };
    } else {
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: errorPage(data.error || "Could not cancel booking. Please contact us at admin@casaserena.com")
      };
    }
  } catch(err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: errorPage("Connection error. Please contact us at admin@casaserena.com")
    };
  }
};

function successPage(uuid) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Booking Cancelled — Casa Serena</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Jost:wght@300;400&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Jost', sans-serif; background: #FAF7F2; color: #2C1A0E; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .card { background: #FDF9F4; border: 1px solid #E8DFD0; border-radius: 12px; padding: 48px 40px; max-width: 480px; width: 90%; text-align: center; }
  .icon { font-size: 40px; margin-bottom: 24px; }
  h1 { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 32px; margin: 0 0 16px; }
  p { color: #6B5240; font-size: 15px; line-height: 1.7; margin: 0 0 12px; }
  .id { font-family: monospace; font-size: 12px; color: #9A8070; }
  .btn { display: inline-block; margin-top: 32px; padding: 14px 32px; background: #A0704A; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
</style>
</head>
<body>
<div class="card">
  <div class="icon">✓</div>
  <h1>Booking Cancelled</h1>
  <p>Your booking has been successfully cancelled. A confirmation email has been sent to your email address.</p>
  <p class="id">Booking ID: ${uuid.substring(0,8).toUpperCase()}</p>
  <p>We hope to welcome you to Casa Serena in the future.</p>
  <a href="https://staylify.netlify.app" class="btn">Return to Site</a>
</div>
</body>
</html>`;
}

function errorPage(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Error — Casa Serena</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Jost:wght@300;400&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Jost', sans-serif; background: #FAF7F2; color: #2C1A0E; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .card { background: #FDF9F4; border: 1px solid #E8DFD0; border-radius: 12px; padding: 48px 40px; max-width: 480px; width: 90%; text-align: center; }
  .icon { font-size: 40px; margin-bottom: 24px; }
  h1 { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 32px; margin: 0 0 16px; }
  p { color: #6B5240; font-size: 15px; line-height: 1.7; }
  .btn { display: inline-block; margin-top: 32px; padding: 14px 32px; background: #A0704A; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
</style>
</head>
<body>
<div class="card">
  <div class="icon">⚠</div>
  <h1>Something went wrong</h1>
  <p>${message}</p>
  <a href="https://staylify.netlify.app" class="btn">Return to Site</a>
</div>
</body>
</html>`;
}
