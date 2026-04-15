// netlify/functions/booking.js
// Proxies all Google Apps Script requests server-side to avoid browser redirect/CORS issues

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxO0M_fC4LR346Uqkb0W4Q-sWXBNQL3Mqc8zSB9xw-bOd51yvtHNdXnPL9PzQcALYSuiA/exec";

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
