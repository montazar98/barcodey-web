"use client";
import { useI18n } from "@/i18n/client";
import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Copy, ExternalLink, CheckCircle, XCircle, ScanLine } from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";

export function QRScanner() {
  const t = useI18n();
  const [mode, setMode] = useState<"camera" | "upload">("upload");
  const [result, setResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const decodeFromImage = async (imageElement: HTMLImageElement): Promise<string | null> => {
    // Use the BarcodeDetector API if available (modern browsers)
    if ("BarcodeDetector" in window) {
      try {
        // @ts-ignore
        const detector = new window.BarcodeDetector({ formats: ["qr_code", "ean_13", "code_128", "ean_8", "upc_a", "code_39"] });
        const canvas = document.createElement("canvas");
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(imageElement, 0, 0);
        const codes = await detector.detect(canvas);
        if (codes.length > 0) return codes[0].rawValue;
      } catch {
        // fallback
      }
    }

    // Fallback: use canvas pixel analysis for simple QR codes
    // Return null if cannot decode
    return null;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    setScanning(true);
    setResult(null);

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = async () => {
      const decoded = await decodeFromImage(img);
      if (decoded) {
        setResult(decoded);
        toast.success(t.scanner.success_toast);
      } else {
        // Try a simple approach - show the image and hint
        toast.error("لم يتم التعرف على الرمز. يرجى التأكد من وضوح الصورة.");
        setResult(null);
      }
      setScanning(false);
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      toast.error("خطأ في قراءة الصورة");
      setScanning(false);
      URL.revokeObjectURL(url);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFileUpload(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraStarted(true);
      toast.success(t.scanner.start_camera_toast || "Camera started");

      // Start scanning frames
      const scanLoop = async () => {
        if (!videoRef.current || !canvasRef.current || !streamRef.current) return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          if ("BarcodeDetector" in window) {
            try {
              // @ts-ignore
              const detector = new window.BarcodeDetector({ formats: ["qr_code", "ean_13", "code_128", "ean_8", "upc_a"] });
              const codes = await detector.detect(canvas);
              if (codes.length > 0) {
                setResult(codes[0].rawValue);
                toast.success(t.scanner.success_toast);
                stopCamera();
                return;
              }
            } catch {
              // continue
            }
          }
        }
        if (streamRef.current) {
          requestAnimationFrame(scanLoop);
        }
      };
      requestAnimationFrame(scanLoop);
    } catch {
      toast.error(t.scanner.error_camera);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraStarted(false);
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    toast.success(t.scanner.success_copy);
  };

  const isUrl = result && (result.startsWith("http://") || result.startsWith("https://"));

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="card">
        <div className="flex gap-3">
          {(["upload", "camera"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                stopCamera();
                setResult(null);
              }}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all",
                mode === m
                  ? "bg-brand-500 text-gray-950"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              {m === "upload" ? <Upload className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              {m === "upload" ? t.scanner.upload : t.scanner.camera}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      {mode === "upload" && (
        <div
          className={clsx(
            "card border-dashed border-2 transition-colors cursor-pointer text-center py-16",
            dragOver
              ? "border-brand-500 bg-brand-500/5"
              : "border-gray-700 hover:border-brand-500/50"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">{t.scanner.drag_drop}</p>
          <p className="text-gray-400 text-sm">{t.scanner.click_upload}</p>
          <p className="text-gray-600 text-xs mt-2">{t.scanner.supported_formats}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* Camera */}
      {mode === "camera" && (
        <div className="card text-center">
          {!cameraStarted ? (
            <div className="py-12">
              <Camera className="w-16 h-16 text-gray-500 mx-auto mb-6" />
              <p className="text-gray-300 mb-2 font-medium">{t.scanner.scan_instruction}</p>
              <p className="text-gray-500 text-sm mb-6">
                {t.scanner.scan_auto}
              </p>
              <button onClick={startCamera} className="btn-primary">
                <Camera className="w-5 h-5" />
                {t.scanner.start_camera}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-xl"
                  autoPlay
                  playsInline
                  muted
                />
                {/* Scan overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-brand-400 rounded-2xl shadow-lg shadow-brand-500/20">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-400 rounded-br-lg" />
                  </div>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex items-center justify-center gap-2 text-brand-400">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                <span className="text-sm">{t.scanner.scanning}</span>
              </div>
              <button onClick={stopCamera} className="btn-secondary w-full">
                <XCircle className="w-5 h-5" />
                {t.scanner.stop_camera}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scanning Indicator */}
      {scanning && (
        <div className="card flex items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="text-gray-200 font-medium">{t.scanner.analyzing}</p>
            <p className="text-gray-500 text-xs">{t.scanner.analyzing_desc}</p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="card border border-brand-500/30 bg-brand-500/5">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-brand-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white mb-2">{t.scanner.success_scan}</h3>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-300 text-sm break-all font-mono">{result}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={copyResult} className="btn-secondary flex-1 justify-center text-sm">
              <Copy className="w-4 h-4" />
              {t.scanner.copy}
            </button>
            {isUrl && (
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 justify-center text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                {t.scanner.open_link}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Browser Support Note */}
      <div className="card border border-gray-700 bg-gray-800/30">
        <div className="flex items-start gap-3">
          <ScanLine className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-300 text-sm font-medium">{t.scanner.browser_note}</p>
            <p className="text-gray-500 text-xs mt-1">
              {t.scanner.browser_note_desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
