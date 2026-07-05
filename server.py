"""
Koe — Japanese & Turkish text-to-speech backend.

Uses edge-tts (Microsoft Edge's online neural voices). No API key, no signup.
It connects to Microsoft's public read-aloud endpoint the same way the Edge
browser does.
"""

import asyncio
import io

import edge_tts
from flask import Flask, request, send_file, jsonify, send_from_directory

app = Flask(__name__, static_folder="public", static_url_path="")

# One voice per language. Swap for any name from `edge-tts --list-voices`.
VOICES = {
    "ja-JP": "ja-JP-NanamiNeural",   # Japanese, female
    "tr-TR": "tr-TR-EmelNeural",     # Turkish, female
}

MAX_CHARS = 5000


async def synth(text: str, voice: str, rate: str, pitch: str) -> bytes:
    """Stream audio from edge-tts into an in-memory buffer."""
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    buf = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buf.write(chunk["data"])
    buf.seek(0)
    return buf.read()


@app.route("/")
def index():
    return send_from_directory("public", "index.html")


@app.route("/synthesize", methods=["POST"])
def synthesize():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    lang = data.get("lang")

    if not text:
        return jsonify(error="Please enter some text."), 400
    if lang not in VOICES:
        return jsonify(error="Unsupported language."), 400
    if len(text) > MAX_CHARS:
        return jsonify(error=f"Text is too long ({MAX_CHARS} character max)."), 400

    # edge-tts wants rate/pitch as signed percentage / Hz strings.
    # Frontend sends rate as a multiplier (1.0 = normal) and pitch in Hz.
    try:
        rate_mult = float(data.get("rate", 1.0))
        pitch_hz = float(data.get("pitch", 0.0))
    except (TypeError, ValueError):
        return jsonify(error="Invalid rate or pitch."), 400

    rate_str = f"{round((rate_mult - 1) * 100):+d}%"   # 1.0 -> +0%, 1.2 -> +20%
    pitch_str = f"{round(pitch_hz):+d}Hz"               # 0 -> +0Hz

    try:
        audio = asyncio.run(synth(text, VOICES[lang], rate_str, pitch_str))
    except Exception as exc:  # noqa: BLE001
        app.logger.error("TTS failed: %s", exc)
        return jsonify(error="Could not generate audio. Are you online?"), 500

    return send_file(
        io.BytesIO(audio),
        mimetype="audio/mpeg",
        as_attachment=False,
        download_name="speech.mp3",
    )


if __name__ == "__main__":
    print("Running at http://localhost:5000")
    app.run(port=5000, debug=False)
