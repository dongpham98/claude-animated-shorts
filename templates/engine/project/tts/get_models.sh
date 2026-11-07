#!/bin/bash
# Download Kokoro v1.0 (ONNX) from GitHub releases (Hugging Face is blocked in the cloud) and build kokoro-dur.onnx,
# a copy whose graph also outputs the per-phoneme durations (/encoder/Round_output_0) used for exact word timings.
set -e
KD=${KOKORO_DIR:-$HOME/tts}; mkdir -p "$KD"; cd "$KD"
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -f $f ] || curl -sSL -o $f https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f
done
pip install -q --break-system-packages kokoro-onnx soundfile onnx 2>/dev/null || pip install -q kokoro-onnx soundfile onnx
python3 - <<'PY'
import onnx
m = onnx.load('kokoro-v1.0.onnx')
m.graph.output.append(onnx.helper.make_tensor_value_info('/encoder/Round_output_0', onnx.TensorProto.FLOAT, None))
onnx.save(m, 'kokoro-dur.onnx')
print("kokoro-dur.onnx ready")
PY
