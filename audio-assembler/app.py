"""
VoiceSplice — Speaker-Labelled Audio Assembler
Backend: Flask + librosa + soundfile + resampy + imageio-ffmpeg

Folder layout:
    audio-assembler/
    ├── app.py
    ├── index.html
    ├── requirements.txt
    ├── speakers/          ← PUT YOUR LABEL CLIPS HERE
    │   ├── Speaker_00.mp3     (says "Speaker 0 is speaking")
    │   ├── Speaker_01.mp3
    │   ├── Speaker_02.mp3
    │   └── ...
    ├── uploads/           ← auto-created (temp uploaded audio)
    └── outputs/           ← auto-created (final MP3 saved here)
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import numpy as np
import soundfile as sf
import resampy
import os, uuid, json, re, subprocess, traceback
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)
CORS(app)

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
SPEAKERS_DIR  = os.path.join(BASE_DIR, "speakers")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "outputs")
for d in [SPEAKERS_DIR, UPLOAD_FOLDER, OUTPUT_FOLDER]:
    os.makedirs(d, exist_ok=True)

# ── Constants ─────────────────────────────────────────────────────────────────
TARGET_SR        = 16000          # 16 kHz — good for speech
FADE_MS          = 15             # crossfade duration in milliseconds
FADE_SAMPLES     = int(FADE_MS / 1000 * TARGET_SR)
MIN_SEG_DURATION = 0.5            # skip label if segment shorter than this (sec)
AUDIO_EXTS       = ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac']


# ════════════════════════════════════════════════════════════════════════════════
#  AUDIO LOADING  (librosa handles MP3/M4A/OGG; soundfile handles WAV/FLAC)
# ════════════════════════════════════════════════════════════════════════════════

def load_audio(path: str):
    """
    Load any supported audio file.
    Returns: (data: np.ndarray shape (N, channels), sample_rate: int)
    """
    ext = os.path.splitext(path)[1].lower()

    if ext in ('.wav', '.flac', '.aiff', '.aif'):
        # soundfile is fastest for lossless formats
        data, sr = sf.read(path, dtype='float32', always_2d=True)
        return data, sr

    # MP3, M4A, OGG, AAC → use librosa (bundles its own decoder)
    import librosa
    y, sr = librosa.load(path, sr=None, mono=False)
    # librosa returns (samples,) for mono or (channels, samples) for stereo
    if y.ndim == 1:
        data = y.reshape(-1, 1).astype('float32')
    else:
        data = y.T.astype('float32')          # → (samples, channels)
    return data, sr


# ════════════════════════════════════════════════════════════════════════════════
#  AUDIO PROCESSING HELPERS
# ════════════════════════════════════════════════════════════════════════════════

def ensure_sr(audio: np.ndarray, sr: int, target: int = TARGET_SR) -> np.ndarray:
    """Resample to target sample rate if needed."""
    if sr == target:
        return audio
    return resampy.resample(audio, sr, target, axis=0).astype('float32')


def ensure_channels(audio: np.ndarray, n_ch: int) -> np.ndarray:
    """Convert mono↔stereo so all clips share the same channel count."""
    c = audio.shape[1]
    if c == n_ch:
        return audio
    if c == 1 and n_ch == 2:
        return np.repeat(audio, 2, axis=1)      # mono → stereo
    if c == 2 and n_ch == 1:
        return audio.mean(axis=1, keepdims=True) # stereo → mono
    return audio



def cosine_fade(length: int) -> np.ndarray:
    """Return a (length, 1) fade envelope using a raised-cosine curve."""
    t = np.linspace(0, np.pi, length)
    return ((1 - np.cos(t)) / 2).reshape(-1, 1)


def extract_segment(audio: np.ndarray, start_s: float, end_s: float) -> np.ndarray:
    """
    Slice [start_s, end_s] from audio (already at TARGET_SR).
    Applies a short cosine fade-in and fade-out to avoid clicks at cut points.
    """
    s = int(start_s * TARGET_SR)
    e = min(int(end_s  * TARGET_SR), len(audio))
    seg = audio[s:e].copy()
    if len(seg) == 0:
        return seg
    fade_len = min(FADE_SAMPLES, len(seg) // 2)
    if fade_len > 0:
        fade = cosine_fade(fade_len)
        seg[:fade_len]  *= fade
        seg[-fade_len:] *= fade[::-1]
    return seg


def resolve_overlaps(segments: list) -> list:
    """
    If segment[i+1] starts before segment[i] ends, trim segment[i].
    This handles diarization output that has small overlapping regions.
    """
    clean = []
    for spk, start, end in segments:
        if clean and start < clean[-1][2]:
            prev_spk, prev_start, _ = clean[-1]
            trimmed_end = start
            if trimmed_end > prev_start:
                clean[-1] = (prev_spk, prev_start, trimmed_end)
            else:
                clean.pop()
        if end > start:
            clean.append((spk, start, end))
    return clean


# ════════════════════════════════════════════════════════════════════════════════
#  SPEAKER FILE LOOKUP
#  Maps a speaker ID like "SPEAKER_00" to a file like "Speaker_00.mp3"
# ════════════════════════════════════════════════════════════════════════════════

def find_label_file(speaker_id: str) -> str | None:
    """
    Finds the label audio clip for a given speaker ID.

    Handles both naming conventions:
      - Diarization-style: SPEAKER_00, SPEAKER_01, SPEAKER_02
      - Simple numeric:    1, 01, 2, 02

    Matching file examples (any of these work):
      Speaker_00.mp3  Speaker_0.mp3  speaker_00.wav  SPEAKER_00.mp3
      Speaker_01.mp3  (for SPEAKER_00 using +1 offset)
    """
    sid     = speaker_id.strip()
    numeric = re.sub(r'[^0-9]', '', sid)          # "SPEAKER_02" → "02"

    if not numeric:
        # No digits at all — try exact filename match only
        for ext in AUDIO_EXTS:
            p = os.path.join(SPEAKERS_DIR, sid + ext)
            if os.path.isfile(p):
                return p
        return None

    num_int       = int(numeric)
    num_padded    = str(num_int).zfill(2)          # 2 → "02"
    num_unpadded  = str(num_int)                   # 2 → "2"
    # +1 variant: SPEAKER_00 might correspond to Speaker_01.mp3
    num1_padded   = str(num_int + 1).zfill(2)
    num1_unpadded = str(num_int + 1)

    # All candidate filename stems, in priority order
    candidates = [
        sid,                              # SPEAKER_00    (exact)
        sid.lower(),                      # speaker_00
        f"Speaker_{num_padded}",          # Speaker_00
        f"Speaker_{num_unpadded}",        # Speaker_0
        f"Speaker_{num1_padded}",         # Speaker_01  (+1 offset)
        f"Speaker_{num1_unpadded}",       # Speaker_1   (+1 offset)
        f"speaker_{num_padded}",
        f"speaker_{num1_padded}",
        f"SPK_{num_padded}",
        f"SPK_{num1_padded}",
        f"spk_{num_padded}",
        num_padded,                       # 00
        num_unpadded,                     # 0
    ]

    for name in candidates:
        for ext in AUDIO_EXTS:
            path = os.path.join(SPEAKERS_DIR, name + ext)
            if os.path.isfile(path):
                print(f"  [LABEL] {speaker_id!r} → {os.path.basename(path)}")
                return path

    # Fuzzy fallback: scan speakers/ for any file whose name contains the number
    try:
        for fname in sorted(os.listdir(SPEAKERS_DIR)):
            if not any(fname.lower().endswith(e) for e in AUDIO_EXTS):
                continue
            stem = os.path.splitext(fname)[0]
            nums = re.findall(r'\d+', stem)
            if any(int(n) in (num_int, num_int + 1) for n in nums):
                path = os.path.join(SPEAKERS_DIR, fname)
                print(f"  [LABEL] {speaker_id!r} → {fname} (fuzzy match)")
                return path
    except Exception:
        pass

    print(f"  [LABEL] {speaker_id!r} → NOT FOUND")
    return None


# ════════════════════════════════════════════════════════════════════════════════
#  CORE ASSEMBLY
# ════════════════════════════════════════════════════════════════════════════════

def assemble_audio(raw_path: str, segments: list):
    """
    Build the final audio:
      [label clip] [speech segment] [label clip] [speech segment] ...

    Parameters
    ----------
    raw_path  : path to original conversation audio
    segments  : list of (speaker_id: str, start_sec: float, end_sec: float)

    Returns
    -------
    assembled : np.ndarray  (total_samples, channels)  float32
    sr        : int         TARGET_SR
    missing   : list[str]   speaker IDs with no matching label file
    """
    print(f"\n{'='*60}")
    print(f"  [ASSEMBLE] File  : {os.path.basename(raw_path)}")
    print(f"  [ASSEMBLE] Segs  : {len(segments)}")

    # ── Find label files ──────────────────────────────────────────────────────
    unique_spk  = list(dict.fromkeys(spk for spk, _, _ in segments))  # order-preserving unique
    label_paths = {}
    missing     = []
    for sid in unique_spk:
        p = find_label_file(sid)
        if p:
            label_paths[sid] = p
        else:
            missing.append(sid)

    print(f"  [ASSEMBLE] Labels found  : {list(label_paths.keys())}")
    print(f"  [ASSEMBLE] Labels missing: {missing}")

    # ── Load all audio in parallel ────────────────────────────────────────────
    with ThreadPoolExecutor() as ex:
        raw_future    = ex.submit(load_audio, raw_path)
        label_futures = {sid: ex.submit(load_audio, p)
                         for sid, p in label_paths.items()}

    raw_audio, source_sr = raw_future.result()
    raw_audio = ensure_sr(raw_audio, source_sr)
    n_ch      = raw_audio.shape[1]
    raw_dur   = len(raw_audio) / TARGET_SR
    print(f"  [ASSEMBLE] Raw: {raw_dur:.1f}s  {n_ch}ch  {TARGET_SR}Hz")

    # ── Normalize label clips ─────────────────────────────────────────────────
    label_clips: dict[str, np.ndarray] = {}
    for sid, fut in label_futures.items():
        clip, sr = fut.result()
        clip = ensure_sr(clip, sr)
        clip = ensure_channels(clip, n_ch)
        label_clips[sid] = clip
        print(f"  [ASSEMBLE] Label '{sid}': {len(clip)/TARGET_SR:.2f}s")

    # ── Resolve overlapping timestamps ────────────────────────────────────────
    segments = resolve_overlaps(segments)

    # ── Build piece list ──────────────────────────────────────────────────────
    pieces      = []
    label_count = 0

    for i, (spk_id, start, end) in enumerate(segments):
        seg     = extract_segment(raw_audio, start, end)
        seg_dur = end - start

        if len(seg) == 0:
            print(f"  [SEG {i+1:02d}] {spk_id} {start:.2f}→{end:.2f}s  EMPTY skip")
            continue

        label     = label_clips.get(spk_id)
        use_label = (label is not None and seg_dur >= MIN_SEG_DURATION)

        if use_label:
            pieces.append(label)
            label_count += 1
            print(f"  [SEG {i+1:02d}] {spk_id} {start:.2f}→{end:.2f}s  {seg_dur:.2f}s  ✓ label")
        else:
            reason = "no label" if label is None else f"too short {seg_dur:.2f}s"
            print(f"  [SEG {i+1:02d}] {spk_id} {start:.2f}→{end:.2f}s  {seg_dur:.2f}s  – {reason}")

        pieces.append(seg)

    if not pieces:
        raise ValueError(
            "No audio pieces were assembled. "
            "Check that segment timestamps are within the audio file duration "
            f"({raw_dur:.1f}s)."
        )

    # ── Pre-allocate output buffer and fill ───────────────────────────────────
    total_samples = sum(len(p) for p in pieces)
    out_dur       = total_samples / TARGET_SR
    print(f"  [ASSEMBLE] Output: {out_dur:.1f}s  ({label_count} labels inserted)")
    print(f"{'='*60}\n")

    out    = np.zeros((total_samples, n_ch), dtype='float32')
    cursor = 0
    for p in pieces:
        out[cursor:cursor + len(p)] = p
        cursor += len(p)

    return out, TARGET_SR, missing


# ════════════════════════════════════════════════════════════════════════════════
#  SEGMENT JSON PARSER  (handles both field naming conventions)
# ════════════════════════════════════════════════════════════════════════════════

def parse_segments(raw_json: str) -> list:
    """
    Parse segment JSON into list of (speaker_id, start, end) tuples.

    Accepts:
      1. Bare array:  [{"SpeakerID":"SPEAKER_00","startTimestamp":0,"endTimestamp":5}, ...]
      2. Full object: {"segments":[...], "speakers":[...], "success":true, ...}
      3. Old format:  [{"speaker":"1","start":0,"end":5}, ...]
    """
    data = json.loads(raw_json)

    # Unwrap full response object
    if isinstance(data, dict):
        if "segments" in data:
            data = data["segments"]
        else:
            raise ValueError("JSON object must have a 'segments' key")

    if not isinstance(data, list):
        raise ValueError("Expected a JSON array of segments")

    result = []
    for s in data:
        spk   = (s.get("SpeakerID") or s.get("speaker_id") or
                 s.get("speakerId") or s.get("speaker") or "")
        start = float(s.get("startTimestamp") or s.get("start_time") or
                      s.get("start") or 0)
        end   = float(s.get("endTimestamp")   or s.get("end_time")   or
                      s.get("end")   or 0)
        if end > start:
            result.append((str(spk).strip(), start, end))

    return result


# ════════════════════════════════════════════════════════════════════════════════
#  MP3 EXPORT  (WAV → MP3 via bundled ffmpeg, no PATH setup needed)
# ════════════════════════════════════════════════════════════════════════════════

def export_mp3(wav_path: str, mp3_path: str):
    """Convert a WAV file to MP3 using imageio-ffmpeg's bundled binary."""
    import imageio_ffmpeg
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    result = subprocess.run(
        [ffmpeg, '-y', '-i', wav_path,
         '-codec:a', 'libmp3lame', '-q:a', '2',   # VBR ~190 kbps — high quality
         mp3_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg MP3 encode failed:\n{result.stderr}")


# ════════════════════════════════════════════════════════════════════════════════
#  FLASK ROUTES
# ════════════════════════════════════════════════════════════════════════════════

@app.route("/ping")
def ping():
    """Health check — UI shows green dot when this returns 200."""
    return jsonify({"status": "ok", "speakers_folder": SPEAKERS_DIR})


@app.route("/speakers")
def list_speakers():
    """Return all label audio files found in the speakers/ folder."""
    files = []
    if os.path.isdir(SPEAKERS_DIR):
        for fname in sorted(os.listdir(SPEAKERS_DIR)):
            if any(fname.lower().endswith(e) for e in AUDIO_EXTS):
                files.append(fname)
    return jsonify({"speakers": files, "folder": SPEAKERS_DIR})


@app.route("/assemble", methods=["POST"])
def assemble():
    """
    Main processing endpoint.

    Expects multipart/form-data:
      raw_audio  (file)   — the original conversation recording
      segments   (string) — JSON string of diarization segments

    Returns: downloadable MP3 file
    """
    raw_path = None
    tmp_wav  = None
    out_mp3  = None

    try:
        # ── Validate inputs ───────────────────────────────────────────────────
        raw_file = request.files.get("raw_audio")
        if not raw_file or not raw_file.filename:
            return jsonify({"error": "No raw_audio file provided"}), 400

        seg_json = request.form.get("segments", "").strip()
        if not seg_json:
            return jsonify({"error": "No segments data provided"}), 400

        # ── Save uploaded audio ───────────────────────────────────────────────
        sid      = str(uuid.uuid4())[:8]
        ext      = os.path.splitext(raw_file.filename)[1].lower() or ".wav"
        raw_path = os.path.join(UPLOAD_FOLDER, f"{sid}_raw{ext}")
        raw_file.save(raw_path)
        print(f"\n[REQUEST] Session={sid}  file={raw_file.filename}  ext={ext}")

        # ── Parse segments ────────────────────────────────────────────────────
        try:
            segments = parse_segments(seg_json)
        except (json.JSONDecodeError, ValueError) as e:
            return jsonify({"error": f"Invalid segments JSON: {e}"}), 400

        if not segments:
            return jsonify({"error": "No valid segments found after parsing"}), 400

        print(f"[REQUEST] {len(segments)} segments parsed")

        # ── Assemble ──────────────────────────────────────────────────────────
        assembled, sr, missing = assemble_audio(raw_path, segments)

        # ── Write WAV → encode MP3 ────────────────────────────────────────────
        tmp_wav = os.path.join(OUTPUT_FOLDER, f"{sid}_tmp.wav")
        out_mp3 = os.path.join(OUTPUT_FOLDER, f"{sid}_output.mp3")

        sf.write(tmp_wav, assembled, sr, subtype='PCM_16')
        export_mp3(tmp_wav, out_mp3)

        print(f"[REQUEST] Output MP3: {out_mp3}")

        # ── Send file ─────────────────────────────────────────────────────────
        resp = send_file(
            out_mp3,
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name="assembled_output.mp3"
        )

        # Expose CORS headers so JS can read X-Warning
        resp.headers["Access-Control-Expose-Headers"] = "X-Warning"
        if missing:
            resp.headers["X-Warning"] = (
                f"No label file found for: {', '.join(missing)}. "
                "Those segments were included without a label announcement."
            )

        return resp

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        # Clean up temp files (raw upload + intermediate WAV)
        for p in [raw_path, tmp_wav]:
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass


# ════════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  VoiceSplice — http://127.0.0.1:6000")
    print(f"  Speakers folder : {SPEAKERS_DIR}")
    print(f"  Outputs folder  : {OUTPUT_FOLDER}")
    print("=" * 60 + "\n")
    app.run(debug=True, port=6000)