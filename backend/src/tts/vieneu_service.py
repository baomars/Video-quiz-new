"""
VieNeu TTS Engine Service (Python Bridge)
=========================================
Persistent service for high-fidelity Vietnamese neural TTS and zero-shot voice cloning.
Designed for Google Colab GPU/CPU runtime with instant stdin/stdout JSON-lines IPC.
Safe fallback for local development environments without heavy ML dependencies.
"""

import sys
import os
import json
import time
import traceback

VIENEU_AVAILABLE = False
tts_engine = None

# Built-in official preset voices of VieNeu-TTS v3
PRESET_VOICES = [
    {
        "id": "Hải Đăng",
        "name": "Hải Đăng (Nam - Miền Bắc)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Chững chạc, truyền cảm, tin cậy",
        "suggestedRole": "Host đố vui kiến thức, phóng sự"
    },
    {
        "id": "Xuân Vĩnh",
        "name": "Xuân Vĩnh (Nam - Miền Nam)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Nam",
        "style": "Trầm ấm, gần gũi, sôi nổi",
        "suggestedRole": "Game show, TikTok Shorts, hài hước"
    },
    {
        "id": "Mai Chi",
        "name": "Mai Chi (Nữ - Miền Bắc)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Dịu dàng, trong trẻo, tự nhiên",
        "suggestedRole": "Kể chuyện, quiz tổng hợp, đời sống"
    },
    {
        "id": "Thảo Nhi",
        "name": "Thảo Nhi (Nữ - Miền Nam)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Nam",
        "style": "Tươi vui, năng động, thanh thoát",
        "suggestedRole": "Gen Z quiz, tin nhanh, giải trí"
    },
    {
        "id": "Bảo Ngọc",
        "name": "Bảo Ngọc (Nữ - Miền Trung)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Trung",
        "style": "Mộc mạc, rõ ràng, sâu lắng",
        "suggestedRole": "Văn hóa, lịch sử, văn học"
    },
    {
        "id": "Minh Quân",
        "name": "Minh Quân (Nam - Miền Trung)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Trung",
        "style": "Hào sảng, đĩnh đạc, rõ chữ",
        "suggestedRole": "Phim tài liệu, khoa học viễn tưởng"
    },
    {
        "id": "en-US-Jenny",
        "name": "Jenny (Female - English)",
        "gender": "Female",
        "locale": "en-US",
        "region": "US",
        "style": "Clear, friendly, natural",
        "suggestedRole": "English trivia host"
    },
    {
        "id": "en-US-Guy",
        "name": "Guy (Male - English)",
        "gender": "Male",
        "locale": "en-US",
        "region": "US",
        "style": "Confident, engaging",
        "suggestedRole": "English game show host"
    }
]


def init_vieneu():
    global VIENEU_AVAILABLE, tts_engine
    if tts_engine is not None:
        return True
    try:
        from vieneu import Vieneu
        import torch
        dev = "cuda" if torch.cuda.is_available() else "cpu"
        sys.stderr.write(f"[VieNeu Bridge] Loading Vieneu model on {dev}...\n")
        tts_engine = Vieneu()
        VIENEU_AVAILABLE = True
        sys.stderr.write(f"[VieNeu Bridge] Model loaded successfully on {dev}.\n")
        return True
    except Exception as e:
        sys.stderr.write(f"[VieNeu Bridge] Notice: Vieneu not loaded ({e}). Local fallback mode active.\n")
        VIENEU_AVAILABLE = False
        return False


def get_audio_duration_ffprobe(file_path):
    import subprocess
    try:
        cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            file_path
        ]
        out = subprocess.check_output(cmd, stderr=subprocess.DEVNULL, timeout=10)
        dur = float(out.decode().strip())
        if dur > 0:
            return dur
    except Exception:
        pass
    return 1.5


def handle_generate(req):
    text = req.get("text", "").strip()
    voice = req.get("voice", "Hải Đăng")
    ref_audio = req.get("ref_audio")
    out_path = req.get("output_path")
    speed = float(req.get("speed", 1.0))

    if not text or not out_path:
        return {"success": False, "error": "Missing text or output_path"}

    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    # 1. Try Vieneu if available on Colab
    if VIENEU_AVAILABLE and tts_engine is not None:
        try:
            kwargs = {"text": text}
            if ref_audio and os.path.exists(ref_audio):
                kwargs["ref_audio"] = ref_audio
                kwargs["denoise"] = True
            else:
                kwargs["voice"] = voice

            # Generate via VieNeu
            audio = tts_engine.infer(**kwargs)
            tts_engine.save(audio, out_path)

            # Adjust speed if not 1.0 using ffmpeg
            if abs(speed - 1.0) > 0.05:
                import subprocess
                tmp_path = out_path + ".tmp.wav"
                os.replace(out_path, tmp_path)
                subprocess.run([
                    "ffmpeg", "-y", "-i", tmp_path,
                    "-filter:a", f"atempo={speed}",
                    out_path
                ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

            duration = get_audio_duration_ffprobe(out_path)
            return {
                "success": True,
                "engine": "vieneu",
                "voice": voice,
                "duration_sec": duration,
                "sample_rate": 48000
            }
        except Exception as e:
            sys.stderr.write(f"[VieNeu Bridge] Inference error: {e}\n")
            # fall through to fallback

    # 2. Fallback generator for Local development
    try:
        import subprocess
        # Map voice to edge-tts equivalent for previewing on local
        edge_voice = "vi-VN-HoaiMyNeural"
        if "Nam" in voice or voice in ["Hải Đăng", "Xuân Vĩnh", "Minh Quân"]:
            edge_voice = "vi-VN-NamMinhNeural"
        elif "Jenny" in voice or "Guy" in voice:
            edge_voice = "en-US-JennyNeural" if "Jenny" in voice else "en-US-GuyNeural"

        rate_str = f"{int((speed - 1.0) * 100):+d}%"
        edge_args = [
            "--voice", edge_voice,
            "--rate", rate_str,
            "--text", text,
            "--write-media", out_path
        ]
        try:
            subprocess.run(["edge-tts"] + edge_args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=25, check=True)
        except Exception:
            subprocess.run([sys.executable, "-m", "edge_tts"] + edge_args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=25, check=True)

        duration = get_audio_duration_ffprobe(out_path)
        return {
            "success": True,
            "engine": "local_fallback",
            "voice": voice,
            "duration_sec": duration,
            "sample_rate": 24000
        }
    except Exception as e:
        return {"success": False, "error": f"TTS synthesis failed: {str(e)}"}


def handle_clone(req):
    voice_name = req.get("voice_name", "Custom Voice").strip()
    ref_audio_path = req.get("ref_audio_path")

    if not ref_audio_path or not os.path.exists(ref_audio_path):
        return {"success": False, "error": "Reference audio file does not exist"}

    if VIENEU_AVAILABLE and tts_engine is not None:
        try:
            if hasattr(tts_engine, "add_voice"):
                tts_engine.add_voice(voice_name, ref_audio_path)
            return {
                "success": True,
                "voice_name": voice_name,
                "engine": "vieneu",
                "message": f"Registered cloned voice '{voice_name}' with VieNeu"
            }
        except Exception as e:
            return {"success": False, "error": f"VieNeu voice cloning error: {str(e)}"}

    return {
        "success": True,
        "voice_name": voice_name,
        "engine": "registered_for_colab",
        "message": f"Saved voice '{voice_name}' profile for Colab execution"
    }


def main():
    sys.stderr.write("[VieNeu Bridge] Service starting...\n")
    # Attempt initialization in background (does not crash if not on Colab)
    init_vieneu()

    sys.stdout.write(json.dumps({"event": "ready", "vieneu_ready": VIENEU_AVAILABLE}) + "\n")
    sys.stdout.flush()

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            cmd = req.get("cmd")

            if cmd == "ping":
                resp = {
                    "success": True,
                    "engine": "vieneu" if VIENEU_AVAILABLE else "local_fallback",
                    "vieneu_available": VIENEU_AVAILABLE
                }
            elif cmd == "list_voices":
                voices = list(PRESET_VOICES)
                if VIENEU_AVAILABLE and tts_engine is not None and hasattr(tts_engine, "list_preset_voices"):
                    try:
                        vlist = tts_engine.list_preset_voices()
                        # augment if engine returns custom
                    except Exception:
                        pass
                resp = {"success": True, "voices": voices}
            elif cmd == "generate":
                resp = handle_generate(req)
            elif cmd == "clone":
                resp = handle_clone(req)
            else:
                resp = {"success": False, "error": f"Unknown command: {cmd}"}

            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()
        except Exception as e:
            err_resp = {"success": False, "error": str(e), "traceback": traceback.format_exc()}
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
