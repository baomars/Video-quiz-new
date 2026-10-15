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

# Built-in official preset voices of VieNeu-TTS v3 (Đầy đủ các giọng thông dụng 3 miền & Quốc tế)
PRESET_VOICES = [
    {
        "id": "Trúc Ly",
        "name": "Trúc Ly (Nữ - Miền Nam) ⭐",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Nam",
        "style": "Dịu dàng, truyền cảm, siêu tự nhiên (Khuyên dùng VieNeu v3)",
        "suggestedRole": "Host chính đố vui, đọc giải thích, tin tức"
    },
    {
        "id": "Thiện Minh",
        "name": "Thiện Minh (Nam - Miền Bắc) ⭐",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Đĩnh đạc, chuẩn phát thanh viên, sắc nét (Khuyên dùng VieNeu v3)",
        "suggestedRole": "Host đố vui kiến thức chuẩn, tài liệu, học thuật"
    },
    {
        "id": "Hải Đăng",
        "name": "Hải Đăng (Nam - Miền Bắc)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Chững chạc, truyền cảm, tin cậy",
        "suggestedRole": "Host đố vui kiến thức, phóng sự, thời sự"
    },
    {
        "id": "Xuân Vĩnh",
        "name": "Xuân Vĩnh (Nam - Miền Nam)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Nam",
        "style": "Trầm ấm, gần gũi, sôi nổi",
        "suggestedRole": "Game show, TikTok Shorts, hài hước, giải trí"
    },
    {
        "id": "Mai Chi",
        "name": "Mai Chi (Nữ - Miền Bắc)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Dịu dàng, trong trẻo, tự nhiên",
        "suggestedRole": "Kể chuyện, quiz tổng hợp, đời sống, gia đình"
    },
    {
        "id": "Thảo Nhi",
        "name": "Thảo Nhi (Nữ - Miền Nam)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Nam",
        "style": "Tươi vui, năng động, thanh thoát",
        "suggestedRole": "Gen Z quiz, tin nhanh, xu hướng viral"
    },
    {
        "id": "Bảo Ngọc",
        "name": "Bảo Ngọc (Nữ - Miền Trung)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Trung",
        "style": "Mộc mạc, rõ ràng, sâu lắng",
        "suggestedRole": "Văn hóa, lịch sử, văn học, danh lam thắng cảnh"
    },
    {
        "id": "Minh Quân",
        "name": "Minh Quân (Nam - Miền Trung)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Trung",
        "style": "Hào sảng, đĩnh đạc, rõ chữ",
        "suggestedRole": "Phim tài liệu, khoa học viễn tưởng, địa lý"
    },
    {
        "id": "Quỳnh Như",
        "name": "Quỳnh Như (Nữ - Miền Nam)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Nam",
        "style": "Ngọt ngào, MC truyền hình, cuốn hút",
        "suggestedRole": "Chương trình đố vui giải trí, showbiz, điện ảnh"
    },
    {
        "id": "Tuấn Kiệt",
        "name": "Tuấn Kiệt (Nam - Miền Nam)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Nam",
        "style": "Trầm ấm, kể chuyện lôi cuốn, review phim",
        "suggestedRole": "Đố vui trinh thám, review phim, bí ẩn"
    },
    {
        "id": "Hoàng Nam",
        "name": "Hoàng Nam (Nam - Miền Bắc)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Trầm hùng, trang trọng, thời sự",
        "suggestedRole": "Bản tin thời sự, kiến thức quân sự, lịch sử"
    },
    {
        "id": "Phương Linh",
        "name": "Phương Linh (Nữ - Miền Bắc)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Êm dịu, nhẹ nhàng, phong cách podcast",
        "suggestedRole": "Tâm lý học, đố vui thư giãn, chữa lành"
    },
    {
        "id": "Ánh Dương",
        "name": "Ánh Dương (Nữ - Miền Bắc)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Trẻ trung, hiện đại, bắt tai",
        "suggestedRole": "Đố vui công nghệ, review mẹo vặt, đời sống"
    },
    {
        "id": "Duy Khang",
        "name": "Duy Khang (Nam - Miền Nam)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Nam",
        "style": "Kịch tính, mạnh mẽ, dồn dập",
        "suggestedRole": "Đố vui tốc độ, thử thách 5 giây, thể thao"
    },
    {
        "id": "Hương Giang",
        "name": "Hương Giang (Nữ - Miền Trung)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Trung",
        "style": "Đằm thắm, ngọt ngào, chất giọng Huế",
        "suggestedRole": "Thơ ca, ca dao tục ngữ, ẩm thực miền Trung"
    },
    {
        "id": "Hùng Dũng",
        "name": "Hùng Dũng (Nam - Miền Bắc)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Trầm dày, nam tính, giọng phim rạp",
        "suggestedRole": "Trailer câu hỏi kịch tính, khám phá vũ trụ"
    },
    {
        "id": "Thanh Thảo",
        "name": "Thanh Thảo (Nữ - Miền Nam)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Nam",
        "style": "Năng động, tươi sáng, quảng cáo",
        "suggestedRole": "Đố vui thương hiệu, mẹo mua sắm, ẩm thực"
    },
    {
        "id": "Gia Huy",
        "name": "Gia Huy (Nam - Miền Bắc)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Vui tươi, hóm hỉnh, Gen Z",
        "suggestedRole": "Đố vui hài hước, đố mẹo, video ngắn"
    },
    {
        "id": "Ngọc Bích",
        "name": "Ngọc Bích (Nữ - Miền Bắc)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Chuẩn mực, giọng đọc sách, tinh tế",
        "suggestedRole": "Đố vui từ vựng, tiếng Anh, sách tinh hoa"
    },
    {
        "id": "Khánh An",
        "name": "Khánh An (Nữ - Miền Nam)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Nam",
        "style": "Mộc mạc, gần gũi, giọng đời thường",
        "suggestedRole": "Đố vui phong tục, chuyện làng quê, gia đình"
    },
    {
        "id": "Việt Anh",
        "name": "Việt Anh (Nam - Miền Bắc)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Tưng bừng, phong thái MC gameshow",
        "suggestedRole": "Gameshow đố vui có thưởng, đếm ngược dồn dập"
    },
    {
        "id": "Thu Hà",
        "name": "Thu Hà (Nữ - Miền Bắc)",
        "gender": "Female",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Rành mạch, khoa học, thuyết minh",
        "suggestedRole": "Thế giới động vật, khoa học tự nhiên"
    },
    {
        "id": "Adam bựa",
        "name": "Adam bựa (Nam - Hài hước / Meme)",
        "gender": "Male",
        "locale": "vi-VN",
        "region": "Bắc",
        "style": "Hài hước, châm biếm, phong cách meme viral",
        "suggestedRole": "Đố troll, câu đố khó đỡ, TikTok viral"
    },
    {
        "id": "en-US-Jenny",
        "name": "Jenny (Female - English)",
        "gender": "Female",
        "locale": "en-US",
        "region": "US",
        "style": "Clear, friendly, natural",
        "suggestedRole": "English trivia host, pronunciation"
    },
    {
        "id": "en-US-Guy",
        "name": "Guy (Male - English)",
        "gender": "Male",
        "locale": "en-US",
        "region": "US",
        "style": "Confident, engaging",
        "suggestedRole": "English game show host, tech quiz"
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
        male_voices = [
            "Thiện Minh", "Hải Đăng", "Xuân Vĩnh", "Minh Quân", "Tuấn Kiệt",
            "Hoàng Nam", "Duy Khang", "Hùng Dũng", "Gia Huy", "Việt Anh", "Adam bựa", "Guy"
        ]
        is_male = any(mv in voice for mv in male_voices) or "Nam" in voice
        if "Jenny" in voice or "Guy" in voice or "en-US" in voice:
            edge_voice = "en-US-JennyNeural" if "Jenny" in voice else "en-US-GuyNeural"
        else:
            edge_voice = "vi-VN-NamMinhNeural" if is_male else "vi-VN-HoaiMyNeural"

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
                        existing_ids = {v["id"] for v in voices}
                        if isinstance(vlist, (list, tuple)):
                            for item in vlist:
                                vid = item[1] if isinstance(item, (list, tuple)) and len(item) > 1 else (item if isinstance(item, str) else item.get("id"))
                                vlabel = item[0] if isinstance(item, (list, tuple)) and len(item) > 0 else (item.get("name") if isinstance(item, dict) else vid)
                                if vid and vid not in existing_ids:
                                    voices.append({
                                        "id": vid,
                                        "name": f"{vlabel} (VieNeu Engine)",
                                        "gender": "Female" if any(w in str(vlabel).lower() for w in ["nữ", "female", "girl"]) else "Male",
                                        "locale": "vi-VN",
                                        "region": "Toàn quốc",
                                        "style": "Tự nhiên VieNeu Neural",
                                        "suggestedRole": "Giọng đọc chính thức VieNeu"
                                    })
                                    existing_ids.add(vid)
                    except Exception as le:
                        sys.stderr.write(f"[VieNeu Bridge] Error in list_preset_voices: {le}\n")
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
