// netlify/functions/booking.js
// Proxies all Google Apps Script requests server-side to avoid browser redirect/CORS issues

const APPS_SCRIPT_URL = "\https://script.google.com/macros/s/AKfycbwDxtDv8fVJ9Pqoqmv1C0LEioHi0-OM9RDBLpQMVCe_UBeeB2H5BZgqAvPLP9LPW88C5w/exec";

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};

  const url = APPS_SCRIPT_URL + "?" + new URLSearchParams(params).toString();

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "Accept": "application/json"
      }
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: false, error: "Invalid response from Apps Script: " + text.substring(0, 200) })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data)
    };

  } catch(err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
