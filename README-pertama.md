# Building a Japanese & Turkish Text-to-Speech Website

A complete tutorial for JavaScript developers. You'll build a website where you
type Japanese or Turkish text, generate speech, and download it as an MP3.

This whole project is **Node.js + vanilla JS** — no Python, no framework you
don't already know. If you're comfortable with JS/TS/React, you'll be fine.

---

## Table of contents

1. [How it works (the mental model)](#1-how-it-works)
2. [What you need before starting](#2-prerequisites)
3. [Setting up Google Cloud (the one non-JS part)](#3-google-cloud-setup)
4. [Project structure](#4-project-structure)
5. [Installing and running](#5-install-and-run)
6. [Understanding the code](#6-understanding-the-code)
7. [Customizing it](#7-customizing)
8. [Troubleshooting](#8-troubleshooting)
9. [Deploying it online (optional)](#9-deploying)

---

## 1. How it works

The single most important thing to understand: **the browser cannot save
speech to a file on its own.** The built-in browser voice (`speechSynthesis`)
only plays through your speakers. To get a *downloadable* MP3, you send the text
to a cloud service that returns an audio file.

So the flow is:

```
[ Browser ]  --text-->  [ Your Node server ]  --text-->  [ Google Cloud TTS ]
     ^                                                            |
     |                                                            |
     +------------------------ MP3 file <-------------------------+
```

Why do you need the Node server in the middle, instead of calling Google
directly from the browser? Because calling Google requires a secret credential.
If you put that credential in front-end JavaScript, anyone visiting your site
could steal it and run up your bill. The server keeps the secret hidden. This is
the exact same pattern as any React app that talks to a paid API — the key lives
on the backend.

---

## 2. Prerequisites

- **Node.js 18 or newer.** Check with `node --version`. If you don't have it,
  get it from https://nodejs.org.
- **A Google account.** Any Gmail works.
- **A credit card.** Google requires one to activate the free tier. You will
  *not* be charged as long as you stay under 1,000,000 characters per month,
  which is a lot of text. (If you want to avoid a card entirely, see the note at
  the very bottom.)

---

## 3. Google Cloud setup

This is the only part that isn't JavaScript. It's clicking through a web
console. Follow it exactly — it takes about 5 minutes, and you only do it once.

### Step 3.1 — Create a project

1. Go to https://console.cloud.google.com
2. At the top of the page, click the project dropdown (it might say "Select a
   project"), then **New Project**.
3. Name it anything (e.g. `tts-site`) and click **Create**.
4. Wait a few seconds, then make sure that new project is selected in the
   dropdown at the top.

### Step 3.2 — Enable the Text-to-Speech API

By default, a new project can't use any Google services. You have to turn on the
one you want.

1. In the search bar at the top, type **Cloud Text-to-Speech API**.
2. Click the result, then click the blue **Enable** button.
3. If it asks you to set up billing, follow the prompts and add your card. This
   is the step that unlocks the free tier.

### Step 3.3 — Create a credential (service account key)

A "service account" is a robot user. Your Node server logs in as this robot to
call Google. The login is a JSON file.

1. In the left menu, go to **APIs & Services → Credentials.**
   (Or search "Credentials" in the top bar.)
2. Click **+ Create Credentials → Service account.**
3. Give it any name (e.g. `tts-server`) and click **Create and Continue.**
4. It asks for optional roles — just skip this, click **Continue**, then
   **Done.**
5. Back on the Credentials page, click the service account you just made (under
   "Service Accounts").
6. Go to the **Keys** tab → **Add Key → Create new key.**
7. Choose **JSON** and click **Create.** A `.json` file downloads to your
   computer.

**That JSON file is your credential. Treat it like a password.** Anyone who has
it can use your Google account's TTS quota.

### Step 3.4 — Put the key in your project

1. Find the downloaded `.json` file (probably in your Downloads folder).
2. Move it into the project folder (the one with `server.js` in it).
3. Rename it to exactly `key.json`.

Done with Google. Everything from here is JavaScript.

---

## 4. Project structure

```
tts-site/
├── server.js          ← the Node backend (Express)
├── package.json       ← dependencies & the "start" script
├── key.json           ← YOUR Google credential (you added this)
├── .gitignore         ← keeps key.json & node_modules out of git
└── public/
    └── index.html     ← the whole frontend (HTML + CSS + JS in one file)
```

Two files do the real work: `server.js` (backend) and `public/index.html`
(frontend). That's it.

---

## 5. Install and run

Open a terminal in the project folder and run these commands.

### Step 5.1 — Install dependencies

```bash
npm install
```

This reads `package.json` and downloads the two packages the server needs:
`express` (the web server) and `@google-cloud/text-to-speech` (the official
Google client).

### Step 5.2 — Tell Node where your key is

The Google library automatically looks for an environment variable called
`GOOGLE_APPLICATION_CREDENTIALS` that points to your key file.

**On macOS / Linux:**

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/key.json"
```

**On Windows (PowerShell):**

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\key.json"
```

Note: this variable only lasts for the current terminal window. If you close the
terminal, you'll need to run it again before starting the server. (Section 7
shows how to make it permanent with a `.env` file if you prefer.)

### Step 5.3 — Start it

```bash
npm start
```

You should see:

```
Running at http://localhost:3000
```

Open **http://localhost:3000** in your browser. Type some Japanese or Turkish,
pick the language, hit **Generate speech**, and download the MP3.

To stop the server, press `Ctrl + C` in the terminal.

---

## 6. Understanding the code

Since you know JS, here's what each piece actually does.

### The backend — `server.js`

It's a standard Express server with one meaningful route. In plain terms:

- It serves the `public/` folder as static files, so visiting `/` loads your
  `index.html`.
- It exposes one API endpoint, `POST /synthesize`, that expects a JSON body like
  `{ text, lang, rate, pitch }`.
- Inside that route, it calls Google's `synthesizeSpeech()` with your text and
  the chosen voice, gets back raw MP3 bytes, and sends them straight to the
  browser with `Content-Type: audio/mpeg`.

The core call looks like this:

```javascript
const [response] = await client.synthesizeSpeech({
  input: { text },
  voice: { languageCode: lang, name: '...' }, // ja-JP or tr-TR voice
  audioConfig: { audioEncoding: 'MP3', speakingRate: rate, pitch },
});
res.set('Content-Type', 'audio/mpeg');
res.send(response.audioContent); // the MP3 bytes
```

The two language codes are `ja-JP` (Japanese) and `tr-TR` (Turkish). The
`client` object reads your `key.json` automatically via that environment
variable — you never write the key anywhere in code.

### The frontend — `public/index.html`

Everything (markup, styles, script) is in one file so there's no build step.
The JavaScript at the bottom does what a small React component would, just with
plain DOM calls:

- Tracks which language is selected.
- On button click, `fetch()`s `POST /synthesize` with the text and settings.
- Turns the returned audio into a downloadable link:

```javascript
const res = await fetch('/synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text, lang, rate, pitch }),
});
const blob = await res.blob();               // the MP3 as a Blob
const url = URL.createObjectURL(blob);        // a temporary in-memory URL
audio.src = url;                              // play it
download.href = url;                          // and let the user save it
```

`URL.createObjectURL(blob)` is the key trick: it makes a temporary URL pointing
at the audio data in memory, which you can both play in an `<audio>` element and
offer as a download via an `<a download>` link. This is standard browser stuff
you'd use in React too.

> **Want to port the frontend to React?** You can. Drop the `fetch` logic into a
> component, keep `text`/`lang`/`rate`/`pitch` in `useState`, and store the
> object URL in state to feed an `<audio>` tag. The backend stays exactly the
> same. Just make sure your dev server proxies `/synthesize` to
> `localhost:3000`, or run both and use the full URL.

---

## 7. Customizing

### Change the voices

Open `server.js` and find the `VOICES` object near the top:

```javascript
const VOICES = {
  'ja-JP': { languageCode: 'ja-JP', name: 'ja-JP-Neural2-B' },
  'tr-TR': { languageCode: 'tr-TR', name: 'tr-TR-Standard-A' },
};
```

Swap the `name` for any other voice. Voices ending in `-Neural2` or `-Wavenet`
sound the most human. To see the full list, with the server's env variable still
set, run:

```bash
node -e "const t=require('@google-cloud/text-to-speech');const c=new t.TextToSpeechClient();c.listVoices({languageCode:'ja-JP'}).then(([r])=>r.voices.forEach(v=>console.log(v.name,v.ssmlGender)));"
```

Change `ja-JP` to `tr-TR` for the Turkish list.

### Make the credential permanent with a `.env` file

Retyping the `export` command every time is annoying. To avoid it:

```bash
npm install dotenv
```

Create a file named `.env` in the project root:

```
GOOGLE_APPLICATION_CREDENTIALS=./key.json
```

Then add this as the very first line of `server.js`:

```javascript
import 'dotenv/config';
```

Now `npm start` just works, no `export` needed. (`.env` and `key.json` are
already in `.gitignore` so they won't get committed.)

### Raise the character limit

`server.js` rejects text over 5000 characters per request. Find the check and
change the number if you need longer input.

---

## 8. Troubleshooting

**"Could not load the default credentials" / auth errors**
The environment variable isn't set, or points to the wrong place. Re-run the
`export` / `$env:` command from Step 5.2 in the *same* terminal you start the
server in. Confirm `key.json` is actually in the project folder.

**"Permission denied" or "API not enabled"**
You skipped enabling the Text-to-Speech API (Step 3.2), or billing isn't set up.
Go back to the Google console and make sure the API shows as **Enabled** and
that a billing account is linked.

**The page loads but nothing happens on "Generate"**
Open the browser dev tools (F12) → Network tab, click the button, and look at
the `/synthesize` request. The response body will contain the error message.
Also check the terminal running the server — real errors get logged there.

**Port 3000 already in use**
Something else is on that port. Either stop it, or start on another port:
`PORT=4000 npm start` (macOS/Linux) and open `localhost:4000`.

**Audio plays but won't download**
Make sure you're clicking the "Download MP3" link, not right-clicking the audio
player. The link has a `download` attribute that names the file.

---

## 9. Deploying

To put this online so others can use it, you need a host that runs Node (not a
static host like plain GitHub Pages, because you have a backend). Good free-tier
options: **Render**, **Railway**, or **Fly.io**.

The one gotcha: you can't upload `key.json` to a public repo. Instead, most
hosts let you paste the *contents* of the JSON into an environment variable in
their dashboard. The Google library also accepts the raw JSON via a variable
called `GOOGLE_APPLICATION_CREDENTIALS_JSON` on some setups, or you configure a
"secret file." Check your host's docs for "service account" or "secret files" —
each does it slightly differently, but the idea is the same: keep the key out of
your code, feed it in as a secret at deploy time.

---

## A note on the "no signup" alternative

If you'd genuinely rather not create a Google account or enter a card at all,
there's a library called **edge-tts** that uses Microsoft Edge's voices with no
key and no signup whatsoever. The catch: it's a **Python** library, so the
backend would be Python instead of Node — which is why this tutorial uses Google
(to keep you 100% in JavaScript). If you change your mind and want the Python
version, it's a small backend and the frontend stays identical.

---

That's everything. Build, run, generate, download. If something breaks, the
Troubleshooting section covers the usual suspects.
