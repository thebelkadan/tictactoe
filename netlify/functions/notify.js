const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text } = JSON.parse(event.body);

    if (!text) {
      return { statusCode: 400, body: 'Missing "text" in request body' };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
      }
    );

    if (response.ok) {
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } else {
      const error = await response.text();
      return { statusCode: 500, body: `Telegram error: ${error}` };
    }
  } catch (e) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};