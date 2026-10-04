#!/usr/bin/env python3
"""Offline speech-to-text (Whisper base.en via sherpa-onnx) for voiceover QA and beat alignment.

Model setup (GitHub release, ~200 MB):
  pip install sherpa-onnx
  mkdir -p ~/.cache/asr && cd ~/.cache/asr && curl -sSLO https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-base.en.tar.bz2 && tar xjf sherpa-onnx-whisper-base.en.tar.bz2
"""
import os, subprocess, sys
import numpy as np
import sherpa_onnx

M = os.path.expanduser("~/.cache/asr/sherpa-onnx-whisper-base.en")
_rec = None


def recognizer():
    global _rec
    if _rec is None:
        _rec = sherpa_onnx.OfflineRecognizer.from_whisper(
            encoder=f"{M}/base.en-encoder.int8.onnx", decoder=f"{M}/base.en-decoder.int8.onnx",
            tokens=f"{M}/base.en-tokens.txt", language="en", task="transcribe", num_threads=4)
    return _rec


def load(path, start=None, end=None):
    cmd = ["ffmpeg", "-v", "error"] + (["-ss", str(start)] if start is not None else []) + (["-to", str(end)] if end is not None else []) + \
          ["-i", path, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32)


def transcribe(path, start=None, end=None):
    """Transcribe a span (≤ ~28 s; longer audio is chunked)."""
    audio = load(path, start, end)
    out, step = [], 16000 * 28
    for i in range(0, len(audio), step):
        s = recognizer().create_stream()
        s.accept_waveform(16000, audio[i:i + step])
        recognizer().decode_stream(s)
        out.append(s.result.text.strip())
    return " ".join(out)


if __name__ == "__main__":
    print(transcribe(sys.argv[1]))
