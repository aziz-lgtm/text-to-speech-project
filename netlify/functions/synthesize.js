// Netlify Function: menerima teks, balikin audio MP3.
// Pakai msedge-tts (versi JavaScript dari edge-tts) - tanpa API key.

const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

// Satu suara per bahasa. Ganti kalau mau suara lain.
const VOICES = {
  "ja-JP": "ja-JP-NanamiNeural", // Jepang, perempuan
  "tr-TR": "tr-TR-EmelNeural",   // Turki, perempuan
  "en-US": "en-US-AriaNeural",   // Inggris (US), perempuan
  "en-GB": "en-GB-SoniaNeural",  // Inggris (UK), perempuan
};

const MAX_CHARS = 5000;

exports.handler = async (event) => {
  // Cuma terima POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed." }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Bad request." }) };
  }

  const text = (data.text || "").trim();
  const lang = data.lang;
  const rate = typeof data.rate === "number" ? data.rate : 1.0;
  const pitch = typeof data.pitch === "number" ? data.pitch : 0;

  if (!text) {
    return { statusCode: 400, body: JSON.stringify({ error: "Please enter some text." }) };
  }
  if (!VOICES[lang]) {
    return { statusCode: 400, body: JSON.stringify({ error: "Unsupported language." }) };
  }
  if (text.length > MAX_CHARS) {
    return { statusCode: 400, body: JSON.stringify({ error: `Text too long (${MAX_CHARS} max).` }) };
  }

  // msedge-tts mau rate/pitch sebagai string persen / Hz.
  const ratePct = `${Math.round((rate - 1) * 100) >= 0 ? "+" : ""}${Math.round((rate - 1) * 100)}%`;
  const pitchHz = `${pitch >= 0 ? "+" : ""}${Math.round(pitch)}Hz`;

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(VOICES[lang], OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Kumpulin stream audio jadi satu buffer
    const { audioStream } = tts.toStream(text, { rate: ratePct, pitch: pitchHz });
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audio = Buffer.concat(chunks);

    return {
      statusCode: 200,
      headers: { "Content-Type": "audio/mpeg" },
      body: audio.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not generate audio." }) };
  }
};
