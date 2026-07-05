# Koe — Japanese & Turkish Text-to-Speech

A small website where you type Japanese or Turkish text, generate speech, and
download it as an MP3.

It uses **edge-tts**, which taps into Microsoft Edge's online neural voices.
That means:

- No account
- No API key
- No credit card
- Completely free

The only requirement is an internet connection, because the app talks to
Microsoft's public read-aloud service (the same one the Edge browser uses).

---

## What's in this folder

```
tts-edge/
├── server.py          the backend (Python + Flask)
├── requirements.txt   the two libraries you need to install
├── README.md          this file
└── public/
    └── index.html     the website itself (the page you'll see)
```

---

## Step 1 — Install Python

You need **Python 3.9 or newer**.

Check if you already have it. Open a terminal (Command Prompt or PowerShell on
Windows, Terminal on Mac/Linux) and run:

```bash
python --version
```

If you see something like `Python 3.11.4`, you're set. If you get an error or a
version below 3.9, download Python from https://www.python.org/downloads/ and
install it.

> **Windows tip:** during installation, tick the box that says
> **"Add Python to PATH"**. It saves a lot of trouble later.

---

## Step 2 — Open a terminal in this folder

You need your terminal to be "inside" the `tts-edge` folder.

- **Windows:** open the `tts-edge` folder in File Explorer, click the address
  bar, type `cmd`, and press Enter.
- **Mac:** right-click the folder → Services → "New Terminal at Folder".
- **Any system:** open a terminal and use `cd` to navigate there, e.g.
  `cd Downloads/tts-edge`.

To confirm you're in the right place, run `ls` (Mac/Linux) or `dir` (Windows).
You should see `server.py` in the list.

---

## Step 3 — Install the two dependencies

Run this once:

```bash
pip install -r requirements.txt
```

This installs `edge-tts` and `flask`. It takes about 20 seconds.

> If `pip` isn't recognized, try `pip3` instead, or
> `python -m pip install -r requirements.txt`.

---

## Step 4 — Start the server

```bash
python server.py
```

You'll see:

```
Running at http://localhost:5000
```

Leave this terminal window open — it's your running server. (To stop it later,
press `Ctrl + C`.)

---

## Step 5 — Open the website

Open your browser and go to:

```
http://localhost:5000
```

You'll see the Koe page. Now:

1. Pick **Japanese** or **Turkish** at the top.
2. Type or paste your text.
3. (Optional) Adjust the **Speed** and **Pitch** sliders.
4. Click **Generate speech**.
5. When the audio player appears, press play to preview, then click
   **↓ Download MP3** to save the file.

That's it.

---

## Changing the voices

The default voices are set in `server.py` in the `VOICES` dictionary:

```python
VOICES = {
    "ja-JP": "ja-JP-NanamiNeural",   # Japanese, female
    "tr-TR": "tr-TR-EmelNeural",     # Turkish, female
}
```

To see every available voice for each language, run:

```bash
edge-tts --list-voices
```

Some good options:

| Language | Voice name           | Gender |
|----------|----------------------|--------|
| Japanese | `ja-JP-NanamiNeural` | Female |
| Japanese | `ja-JP-KeitaNeural`  | Male   |
| Turkish  | `tr-TR-EmelNeural`   | Female |
| Turkish  | `tr-TR-AhmetNeural`  | Male   |

Swap the name in the `VOICES` dictionary, save the file, and restart the server
(`Ctrl + C`, then `python server.py` again).

---

## How the sliders work

- **Speed** is a multiplier: `1.0×` is normal, `1.2×` is 20% faster, `0.8×` is
  slower. The server converts this to the `+20%` / `-20%` format edge-tts uses.
- **Pitch** is in Hz, from `-50` to `+50`. `0` is the natural pitch; higher
  values sound brighter, lower values sound deeper.

---

## Troubleshooting

**"Could not generate audio. Are you online?"**
edge-tts needs internet access. Check your connection. If you're behind a strict
firewall or VPN, it may block Microsoft's endpoint — try turning the VPN off.

**`pip` or `python` "not found"**
Try `pip3` / `python3`. On Windows, reinstall Python and make sure "Add Python
to PATH" is ticked.

**Port 5000 is already in use**
Another program is using that port. Open `server.py`, find the line
`app.run(port=5000, debug=False)`, change `5000` to something like `5050`, save,
and use `http://localhost:5050` instead.

**The audio sounds robotic or wrong for the language**
Make sure the language button matches your text — Japanese text needs the
Japanese voice, Turkish text needs the Turkish voice.

**It worked before but suddenly errors**
Microsoft occasionally tweaks the service. Update the library with
`pip install -U edge-tts` and restart.

---

## A few notes

- Each request is capped at **5000 characters** (set by `MAX_CHARS` in
  `server.py`). Raise it if you need longer text.
- This runs on **your own computer** only. If you want to put it online for
  others to use, you'd deploy it to a host like Render, Railway, or a small VPS —
  ask if you'd like a guide for that.
