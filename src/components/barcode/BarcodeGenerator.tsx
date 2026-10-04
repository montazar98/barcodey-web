"use client";
import { useI18n } from "@/i18n/client";
import { useState, useRef, useEffect, useCallback } from "react";
import JsBarcode from "jsbarcode";
import toast from "react-hot-toast";
import { Download, Copy, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

const BARCODE_FORMATS = [
  { value: "CODE128", label: "CODE128 (عام)" },
  { value: "EAN13", label: "EAN-13 (منتجات)" },
  { value: "EAN8", label: "EAN-8" },
  { value: "UPC", label: "UPC-A" },
  { value: "CODE39", label: "CODE39" },
  { value: "ITF14", label: "ITF-14" },
  { value: "MSI", label: "MSI" },
  { value: "pharmacode", label: "Pharmacode" },
];

const DEFAULT_VALUES: Record<string, string> = {
  CODE128: "Barcodey123",
  EAN13: "5901234123457",
  EAN8: "96385074",
  UPC: "012345678905",
  CODE39: "BARCODE",
  ITF14: "12345678901234",
  MSI: "12345",
  pharmacode: "1234",
};

export function BarcodeGenerator() {
  const t = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const [format, setFormat] = useState("CODE128");
  const [value, setValue] = useState("Barcodey123");
  const [lineColor, setLineColor] = useState("#00d9a3");
  const [bgColor, setBgColor] = useState("#0a0f0d");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const [error, setError] = useState("");

  const generateBarcode = useCallback(() => {
    if (!svgRef.current || !value.trim()) return;
    try {
      JsBarcode(svgRef.current, value, {
        format,
        lineColor,
        background: bgColor,
        width,
        height,
        displayValue,
        fontOptions: "bold",
        fontSize: 14,
        textMargin: 6,
        margin: 16,
      });
      setError("");
    } catch (e) {
      setError(t.barcode.invalid_value);
    }
  }, [format, value, lineColor, bgColor, width, height, displayValue]);

  useEffect(() => {
    generateBarcode();
  }, [generateBarcode]);

  const handleFormatChange = (f: string) => {
    setFormat(f);
    setValue(DEFAULT_VALUES[f] || "Barcode");
  };

  const downloadSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = "barcodey.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
    toast.success(t.barcode.success_svg);
  };

  const downloadPNG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const img = new Image();
    const canvas = document.createElement("canvas");
    const svg = svgRef.current;
    canvas.width = svg.clientWidth || 400;
    canvas.height = svg.clientHeight || 150;
    const ctx = canvas.getContext("2d")!;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = "barcodey.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success(t.barcode.success_png);
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Controls */}
      <div className="space-y-6">
        <div className="card">
          <h2 className="font-bold text-white mb-4">{t.barcode.type}</h2>
          <div className="grid grid-cols-2 gap-2">
            {BARCODE_FORMATS.map(({ value: v, label }) => (
              <button
                key={v}
                onClick={() => handleFormatChange(v)}
                className={clsx(
                  "px-3 py-2.5 rounded-xl text-sm font-medium transition-all border",
                  format === v
                    ? "bg-brand-500/10 text-brand-400 border-brand-500/30"
                    : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600 hover:text-gray-200"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-bold text-white">{t.barcode.value}</h2>
          <div>
            <input
              className={clsx("input", error && "border-red-500 focus:ring-red-500/50")}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t.barcode.placeholder}
            />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
        </div>

        <div className="card space-y-5">
          <h2 className="font-bold text-white">{t.barcode.customization}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t.barcode.line_color}</label>
              <div className="flex items-center gap-3">
                <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-700 bg-transparent" />
                <span className="text-gray-400 text-xs font-mono">{lineColor}</span>
              </div>
            </div>
            <div>
              <label className="label">{t.barcode.bg_color}</label>
              <div className="flex items-center gap-3">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-700 bg-transparent" />
                <span className="text-gray-400 text-xs font-mono">{bgColor}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="label">{t.barcode.line_width} {width}</label>
            <input type="range" min="1" max="5" step="0.5" value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full accent-brand-500" />
          </div>

          <div>
            <label className="label">{t.barcode.height} {height}px</label>
            <input type="range" min="50" max="200" step="5" value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-brand-500" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDisplayValue(!displayValue)}
              className={clsx(
                "relative w-12 h-6 rounded-full transition-colors duration-200",
                displayValue ? "bg-brand-500" : "bg-gray-700"
              )}
            >
              <span className={clsx(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                displayValue ? "right-1" : "left-1"
              )} />
            </button>
            <label className="text-sm text-gray-300">{t.barcode.show_text}</label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-24 space-y-6">
        <div className="card flex flex-col items-center">
          <h2 className="font-bold text-white mb-6 self-start">{t.barcode.preview}</h2>
          <div
            className="rounded-2xl overflow-hidden p-4 w-full flex items-center justify-center min-h-[160px]"
            style={{ backgroundColor: bgColor }}
          >
            <svg ref={svgRef} className="max-w-full" />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8 w-full">
            <button onClick={downloadSVG} className="btn-primary justify-center gap-2">
              <Download className="w-4 h-4" />
              {t.barcode.download_svg}
            </button>
            <button onClick={downloadPNG} className="btn-secondary justify-center gap-2">
              <Download className="w-4 h-4" />
              {t.barcode.download_png}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
