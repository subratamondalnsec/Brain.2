# VoiceSplice — Speaker Audio Assembler
### Windows Setup Guide

---

## EXACT FOLDER STRUCTURE

Create this folder anywhere on your PC (e.g. Desktop or C:\Projects):

```
audio-assembler\
├── app.py
├── index.html
├── requirements.txt
├── README.md
├── speakers\                ← YOUR LABEL CLIPS GO HERE
│   ├── Speaker_01.mp3
│   ├── Speaker_02.mp3
│   ├── Speaker_03.mp3
│   └── (add more as needed)
├── uploads\                 ← auto-created by app.py
└── outputs\                 ← auto-created by app.py (saved MP3 files here)
```

> The `uploads\` and `outputs\` folders are created automatically when you
> first run app.py — you do NOT need to create them yourself.

---

## STEP 1 — Install Python (skip if already installed)

1. Go to: https://www.python.org/downloads/
2. Download Python 3.10 or newer
3. Run the installer
4. ✅ IMPORTANT: On the first screen, CHECK the box that says **"Add Python to PATH"**
5. Click "Install Now"

To verify it worked, open Command Prompt and type:
```
python --version
```
You should see something like `Python 3.11.x`

---

## STEP 2 — Install required packages (one-time only)

Open **Command Prompt** and navigate to your folder:

```
cd C:\Users\YourName\Desktop\audio-assembler
```

Then run:

```
pip install -r requirements.txt
```

This installs:  `flask`  `flask-cors`  `numpy`  `soundfile`  `resampy`  `librosa`  `imageio`  `imageio-ffmpeg`

Wait for it to finish (may take 1–2 minutes).

---

## STEP 3 — Add your speaker label clips

Inside the `speakers\` folder, put short audio clips — one per speaker.

**Naming rules:**
| You can name them | Speaker ID to use in UI |
|---|---|
| `Speaker_01.mp3` | `1` or `01` |
| `Speaker_02.mp3` | `2` or `02` |
| `Speaker_03.wav` | `3` or `03` |

Each clip should be a short recording of someone saying that speaker's name.
Example: a clip of a voice saying *"Speaker 1 is speaking"* saved as `Speaker_01.mp3`

Supported formats: `.mp3` `.wav` `.flac` `.m4a` `.ogg` `.aac`

---

## STEP 4 — Start the backend server

Open **Command Prompt**, navigate to your folder:

```
cd C:\Users\YourName\Desktop\audio-assembler
```

Run:

```
python app.py
```

You should see:
```
==========================================================
  VoiceSplice — running on  http://127.0.0.1:5000
  Speaker labels folder:   C:\...\audio-assembler\speakers
==========================================================
```

**Keep this Command Prompt window open while using the app.**

---

## STEP 5 — Open the UI

Double-click `index.html` to open it in your browser.

- The **green dot** in the top-right means the backend is connected ✅
- The **speakers section** will list all clips found in your `speakers\` folder

---

## HOW TO USE

### Step 1 in UI — Upload audio
Drop your original conversation audio file (the full recording).

### Step 2 in UI — Speaker labels
This is read automatically from your `speakers\` folder.
You'll see chips showing which files were found (e.g. `Speaker_01.mp3`).
Click **↻ Refresh** if you just added new files.

### Step 3 in UI — Segments
**Option A (Manual):** Type in each segment row — Speaker ID, Start time (seconds), End time (seconds).

**Option B (JSON):** Paste your diarization output like this:
```json
[
  {"speaker": "1", "start": 0, "end": 5.2},
  {"speaker": "2", "start": 5.2, "end": 10.8},
  {"speaker": "1", "start": 10.8, "end": 16.0}
]
```
Then click "Parse → Load Segments".

### Assemble
Click **⚡ Assemble Audio** and wait.
Click **⬇ Download** to save `assembled_output.mp3`.

The output is also saved automatically to `outputs\` in your project folder.

---

## OUTPUT FORMAT

- Format: **MP3 (libmp3lame, VBR quality `-q:a 2`)**
- Internally processed as float32 PCM and encoded once at the end
- Compatible with common players and easy to share

---

## COMMON ISSUES

| Problem | Fix |
|---|---|
| `pip` not found | Use `pip3` instead, or reinstall Python with "Add to PATH" checked |
| Red dot — backend offline | Make sure `python app.py` is still running in CMD |
| Speakers show "No files found" | Check your clips are in the `speakers\` folder and named `Speaker_01.mp3` etc. |
| Warning: "no label for speaker X" | The speaker ID in your segment doesn't match any file in `speakers\`. Check naming. |
| Port already in use | Edit the last line of `app.py`: change `port=5000` to `port=5001`, and edit the `const API` line in `index.html` to match |
| Output sounds glitchy | Use WAV source files — compressed formats (MP3/M4A) sometimes have decoding edge cases |

---

## SPEAKER ID MATCHING

The backend tries these filename patterns automatically for speaker `"1"`:
```
Speaker_01   Speaker_1   speaker_01   speaker_1
SPK_01       SPK_1       spk_01       spk_1
01           1
```
So `Speaker_01.mp3` will match when you type `1` as the speaker ID in the UI.
