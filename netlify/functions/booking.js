// netlify/functions/booking.js
// Proxies all Google Apps Script requests server-side
// Version: v2

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby40z6ZtECJC_8RLPAKCi66NjW2mRPYRuFp7XQBkx3QZiWzxx6P1x4UGjUF3L6qx7lGqQ/exec";

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const url = APPS_SCRIPT_URL + "?" + new URLSearchParams(params).toString();

  console.log("[booking] Action:", params.action);
  console.log("[booking] Full URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (compatible; NetlifyFunction/1.0)"
      }
    });

    console.log("[booking] Response status:", response.status);
    console.log("[booking] Response URL:", response.url);
    console.log("[booking] Redirected:", response.redirected);

    const text = await response.text();
    console.log("[booking] Response body:", text.substring(0, 500));

    // Redirected to Google login page
    if (response.url && response.url.includes("accounts.google.com")) {
      console.log("[booking] ERROR: Redirected to Google login");
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          success: false,
          error: "Apps Script requires authentication. Please redeploy with Anyone access."
        })
      };
    }

    // Got HTML instead of JSON
    if (text.trim().startsWith("<")) {
      console.log("[booking] ERROR: Got HTML response");
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          success: false,
          error: "Apps Script returned HTML. Check deployment settings.",
          debug: text.substring(0, 200)
        })
      };
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          success: false,
          error: "Invalid JSON: " + text.substring(0, 200)
        })
      };
    }

    console.log("[booking] Success:", JSON.stringify(data));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data)
    };

  } catch(err) {
    console.log("[booking] FETCH ERROR:", err.message);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, error: "Fetch failed: " + err.message })
    };
  }
};
