"use client";
import { useI18n } from "@/i18n/client";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import { Layers, Download, Trash2, Plus, AlertCircle } from "lucide-react";

const MAX_FREE = 10;

export function BulkGenerator() {
  const t = useI18n();
  const [inputText, setInputText] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [fgColor, setFgColor] = useState("#00d9a3");
  const [bgColor, setBgColor] = useState("#0a0f0d");
  const [size, setSize] = useState(200);

  const parseItems = () => {
    const lines = inputText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) { toast.error(t.bulk.error_empty); return; }
    if (lines.length > MAX_FREE) {
      toast.error(t.bulk.error_limit.replace('{limit}', MAX_FREE.toString()));
      return;
    }
    setItems(lines);
    toast.success(t.bulk.success_generate.replace('{count}', lines.length.toString()));
  };

  const downloadAll = async () => {
    if (items.length === 0) return;
    toast.success(t.bulk.success_downloading);
    // Create a simple download for each QR code
    for (let i = 0; i < items.length; i++) {
      const canvas = document.getElementById(`qr-bulk-${i}`) as HTMLCanvasElement;
      if (!canvas) continue;
      const link = document.createElement("a");
      link.download = `barcodey-${i + 1}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      await new Promise((r) => setTimeout(r, 200));
    }
    toast.success(t.bulk.success_downloaded);
  };

  return (
    <div className="space-y-8">
      {/* Input Area */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">{t.bulk.input_data}</h2>
          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
            {t.bulk.free_limit.replace('{limit}', MAX_FREE.toString())}
          </span>
        </div>
        <textarea
          className="input min-h-[180px] resize-y font-mono text-sm"
          placeholder={t.bulk.placeholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <p className="text-gray-500 text-xs mt-2">
          {t.bulk.input_hint.replace('{limit}', MAX_FREE.toString())}
        </p>
      </div>

      {/* Style Controls */}
      <div className="card">
        <h2 className="font-bold text-white mb-4">{t.bulk.colors}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="label">{t.bulk.fg_color}</label>
            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer border border-gray-700" />
          </div>
          <div>
            <label className="label">{t.bulk.bg_color}</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer border border-gray-700" />
          </div>
          <div>
            <label className="label">{t.bulk.size} {size}px</label>
            <input type="range" min="100" max="400" step="10" value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-brand-500 mt-3" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button onClick={parseItems} className="btn-primary flex-1 justify-center">
          <Layers className="w-5 h-5" />
          {t.bulk.generate}
        </button>
        {items.length > 0 && (
          <button onClick={downloadAll} className="btn-secondary flex-1 justify-center">
            <Download className="w-5 h-5" />
            {t.bulk.download_all}
          </button>
        )}
        {items.length > 0 && (
          <button onClick={() => { setItems([]); setInputText(""); }} className="btn-secondary px-4">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Upgrade notice */}
      {items.length >= MAX_FREE && (
        <div className="card border border-yellow-500/30 bg-yellow-500/5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-medium text-sm">{t.bulk.upgrade_notice}</p>
            <p className="text-yellow-400/70 text-xs mt-1">{t.bulk.upgrade_desc}</p>
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {items.length > 0 && (
        <div>
          <h2 className="font-bold text-white mb-6">{t.bulk.generated_codes.replace('{count}', items.length.toString())}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item, i) => (
              <div key={i} className="card text-center p-3 hover:border-brand-500/30 transition-colors">
                <div className="rounded-xl overflow-hidden mb-2" style={{ backgroundColor: bgColor }}>
                  <QRCodeCanvas
                    id={`qr-bulk-${i}`}
                    value={item}
                    size={size > 200 ? 200 : size}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    level="M"
                    marginSize={1}
                  />
                </div>
                <p className="text-xs text-gray-500 truncate">{item}</p>
                <button
                  onClick={() => {
                    const canvas = document.getElementById(`qr-bulk-${i}`) as HTMLCanvasElement;
                    if (!canvas) return;
                    const link = document.createElement("a");
                    link.download = `barcodey-${i + 1}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                  }}
                  className="text-xs text-brand-400 hover:text-brand-300 mt-2 flex items-center gap-1 justify-center"
                >
                  <Download className="w-3 h-3" />
                  {t.bulk.download}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
