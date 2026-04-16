// netlify/functions/reschedule-v1.js
// Handles guest booking reschedule requests
// Version: v1

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby48XIE2VCFwkIEEqlKz_dSUShg5D_zT1VB1i-tnlt0mXNg-uyA6cam71sc1VaMSHGBxA/exec";

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const uuid = params.uuid;
  const checkIn = params.checkIn;
  const checkOut = params.checkOut;

  if (!uuid) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: errorPage("Invalid reschedule link. Please contact us at admin@casaserena.com")
    };
  }

  // If dates provided, process reschedule
  if (checkIn && checkOut) {
    try {
      const url = APPS_SCRIPT_URL + "?action=rescheduleBooking&uuid=" + encodeURIComponent(uuid) +
        "&checkIn=" + encodeURIComponent(checkIn) + "&checkOut=" + encodeURIComponent(checkOut);
      const response = await fetch(url, { method: "GET", redirect: "follow" });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch(e) { data = { success: false, error: text }; }

      if (data.success) {
        return {
          statusCode: 200,
          headers: { "Content-Type": "text/html" },
          body: successPage(uuid, checkIn, checkOut)
        };
      } else {
        return {
          statusCode: 200,
          headers: { "Content-Type": "text/html" },
          body: errorPage(data.error || "Could not reschedule. Please contact us at admin@casaserena.com")
        };
      }
    } catch(err) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: errorPage("Connection error. Please contact us at admin@casaserena.com")
      };
    }
  }

  // No dates yet — show date picker form
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: datePickerPage(uuid)
  };
};

function datePickerPage(uuid) {
  const today = new Date().toISOString().substring(0, 10);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reschedule Booking — Casa Serena</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Jost:wght@300;400&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Jost', sans-serif; background: #FAF7F2; color: #2C1A0E; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .card { background: #FDF9F4; border: 1px solid #E8DFD0; border-radius: 12px; padding: 48px 40px; max-width: 480px; width: 90%; }
  h1 { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 32px; margin: 0 0 8px; }
  p { color: #6B5240; font-size: 14px; line-height: 1.7; margin: 0 0 24px; }
  .form-group { margin-bottom: 20px; }
  label { display: block; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #9A8070; margin-bottom: 6px; }
  input[type="date"] { width: 100%; padding: 10px 14px; border: 1px solid #E8DFD0; border-radius: 6px; font-family: 'Jost', sans-serif; font-size: 14px; color: #2C1A0E; background: #FAF7F2; outline: none; box-sizing: border-box; }
  input[type="date"]:focus { border-color: #C4A882; }
  .btn { width: 100%; padding: 14px; background: #A0704A; color: white; border: none; border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; margin-top: 8px; }
  .btn:hover { background: #5C3D22; }
  .id { font-family: monospace; font-size: 11px; color: #9A8070; margin-bottom: 24px; }
</style>
</head>
<body>
<div class="card">
  <h1>Reschedule Booking</h1>
  <p class="id">Booking ID: ${uuid.substring(0,8).toUpperCase()}</p>
  <p>Please select your new check-in and check-out dates. We'll confirm availability and send you an updated confirmation.</p>
  <form onsubmit="submitReschedule(event)">
    <div class="form-group">
      <label>New Check-in Date</label>
      <input type="date" id="checkIn" min="${today}" required>
    </div>
    <div class="form-group">
      <label>New Check-out Date</label>
      <input type="date" id="checkOut" min="${today}" required>
    </div>
    <button type="submit" class="btn">Confirm New Dates</button>
  </form>
</div>
<script>
function submitReschedule(e) {
  e.preventDefault();
  var checkIn = document.getElementById("checkIn").value;
  var checkOut = document.getElementById("checkOut").value;
  if (!checkIn || !checkOut) { alert("Please select both dates."); return; }
  if (checkOut <= checkIn) { alert("Check-out must be after check-in."); return; }
  window.location.href = "/.netlify/functions/reschedule-v1?uuid=${uuid}&checkIn=" + checkIn + "&checkOut=" + checkOut;
}
// Auto-set min checkout when checkin changes
document.getElementById("checkIn").addEventListener("change", function() {
  var next = new Date(this.value);
  next.setDate(next.getDate() + 1);
  document.getElementById("checkOut").min = next.toISOString().substring(0,10);
});
</script>
</body>
</html>`;
}

function successPage(uuid, checkIn, checkOut) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Booking Rescheduled — Casa Serena</title>
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
  <h1>Booking Rescheduled</h1>
  <p>Your booking has been rescheduled. A confirmation email has been sent to your email address.</p>
  <p class="id">Booking ID: ${uuid.substring(0,8).toUpperCase()}</p>
  <p>New Check-in: <strong>${checkIn}</strong><br>New Check-out: <strong>${checkOut}</strong></p>
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
