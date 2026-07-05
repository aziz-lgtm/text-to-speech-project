// Simple text-to-speech backend using Google Cloud TTS.
// Keeps your API credentials on the server, out of the browser.

import express from 'express';
import textToSpeech from '@google-cloud/text-to-speech';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Reads credentials from the GOOGLE_APPLICATION_CREDENTIALS env var
// (a path to your service-account JSON key file).
const client = new textToSpeech.TextToSpeechClient();

// Voices chosen for quality. Swap these for others from the voice list
// if you prefer a different sound (see the console list command in README).
const VOICES = {
  'ja-JP': { languageCode: 'ja-JP', name: 'ja-JP-Neural2-B' }, // Japanese, female
  'tr-TR': { languageCode: 'tr-TR', name: 'tr-TR-Standard-A' }, // Turkish, female
};

app.post('/synthesize', async (req, res) => {
  try {
    const { text, lang, rate, pitch } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Please enter some text.' });
    }
    if (!VOICES[lang]) {
      return res.status(400).json({ error: 'Unsupported language.' });
    }
    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text is too long (5000 character max per request).' });
    }

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: VOICES[lang],
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: rate ?? 1.0,
        pitch: pitch ?? 0.0,
      },
    });

    res.set('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not generate audio. Check your server logs.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});
