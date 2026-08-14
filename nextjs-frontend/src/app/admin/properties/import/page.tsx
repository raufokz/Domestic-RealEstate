"use client";

import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/Toast";
import HowTo from "@/components/ui/HowTo";
import { API_BASE, apiPost } from "@/lib/api";

interface PasteListing {
  zpid?: number | null;
  source_url?: string | null;
  price?: number | string | null;
  bedrooms?: number | string | null;
  bathrooms?: number | string | null;
  sqft?: number | string | null;
  status?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  listing_broker?: string | null;
  photos?: string[];
  open_house_date?: string | null;
  open_house_end?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface ParseResponse {
  success: boolean;
  message: string;
  data: { listings: PasteListing[]; count: number };
}

interface ImportPasteResponse {
  success: boolean;
  message: string;
  batch_id: number;
  count: number;
  errors: number;
}

export default function ImportPropertiesPage() {
  const { success, notifyError } = useToast();
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "done">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [previewData, setPreviewData] = useState<any[]>([]);

  const [pasteText, setPasteText] = useState("");
  const [pasteStep, setPasteStep] = useState<"paste" | "preview" | "done">("paste");
  const [detecting, setDetecting] = useState(false);
  const [pasteImporting, setPasteImporting] = useState(false);
  const [detected, setDetected] = useState<PasteListing[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [pasteResult, setPasteResult] = useState<ImportPasteResponse | null>(null);

  const PROPERTY_FIELDS = [
    { key: "price", label: "Price", required: true },
    { key: "address", label: "Street Address", required: true },
    { key: "city", label: "City", required: true },
    { key: "state", label: "State", required: true },
    { key: "zip", label: "Zip Code", required: true },
    { key: "title", label: "Property Title", required: false },
    { key: "description", label: "Description", required: false },
    { key: "bedrooms", label: "Bedrooms", required: false },
    { key: "bathrooms", label: "Bathrooms", required: false },
    { key: "sqft", label: "Square Feet", required: false },
    { key: "property_type", label: "Property Type (e.g. House, Condo)", required: false },
    { key: "photos", label: "Photos / Images (URLs)", required: false },
    { key: "email", label: "Listing Agent Email", required: false },
  ];

  const autoDetectMappings = (headers: string[]) => {
    const initialMappings: Record<string, string> = {};
    const normalize = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

    const aliases: Record<string, string[]> = {
      title: ["title", "propertytitle", "listingtitle", "name", "propertyname"],
      description: ["description", "desc", "details", "summary", "propertydescription"],
      price: ["price", "listprice", "askingprice", "amount", "cost"],
      address: ["address", "streetaddress", "street", "addressline1", "address1"],
      city: ["city", "town"],
      state: ["state", "province", "region"],
      zip: ["zip", "zipcode", "postalcode", "postcode"],
      bedrooms: ["bedrooms", "beds", "bed", "br"],
      bathrooms: ["bathrooms", "baths", "bath", "ba"],
      sqft: ["sqft", "squarefeet", "squarefootage", "area", "livingarea"],
      property_type: ["propertytype", "type", "category", "hometype"],
      photos: ["photos", "photo", "images", "image", "picture", "pictures", "photourl", "imageurl", "img"],
      email: ["email", "realtoremail", "agentemail", "listingagentemail", "contactemail"],
    };

    PROPERTY_FIELDS.forEach((field) => {
      const list = aliases[field.key] || [];
      const match = headers.find((h) => {
        const norm = normalize(h);
        return list.some((alias) => norm === alias || norm.includes(alias) || alias.includes(norm));
      });
      if (match) {
        initialMappings[field.key] = match;
      }
    });

    return initialMappings;
  };

  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(cur.trim().replace(/^["']|["']$/g, ""));
        cur = "";
      } else {
        cur += char;
      }
    }
    values.push(cur.trim().replace(/^["']|["']$/g, ""));
    return values;
  };

  const parseFilePreview = (f: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let headers: string[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawRows: any[] = [];

        if (f.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          rawRows.push(...list.slice(0, 5));
          if (list.length > 0) {
            headers = Object.keys(list[0]);
          }
        } else {
          const lines = text.split(/\r?\n/);
          if (lines.length > 0) {
            headers = parseCSVLine(lines[0]);
            for (let i = 1; i < Math.min(lines.length, 6); i++) {
              if (!lines[i].trim()) continue;
              const values = parseCSVLine(lines[i]);
              const row: Record<string, string> = {};
              headers.forEach((h, idx) => {
                row[h] = values[idx] || "";
              });
              rawRows.push(row);
            }
          }
        }

        setFileHeaders(headers);
        setPreviewData(rawRows);
        setMappings(autoDetectMappings(headers));
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsText(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      parseFilePreview(f);
      setStep("mapping");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      parseFilePreview(f);
      setStep("mapping");
    }
  };

  const handleMappingChange = (fieldKey: string, headerName: string) => {
    setMappings((prev) => ({
      ...prev,
      [fieldKey]: headerName,
    }));
  };

  const requiredFieldsMissing = () => {
    const missing = PROPERTY_FIELDS.filter((f) => f.required && !mappings[f.key]);
    if (missing.length > 0) {
      notifyError(`Map these required fields before continuing: ${missing.map((f) => f.label).join(", ")}`);
      return true;
    }
    return false;
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setStep("preview");
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("column_map", JSON.stringify(mappings));

      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      setProgress(50);
      const res = await fetch(`${API_BASE}/properties/import`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "Failed to upload file");
      }

      const data = await res.json();
      setProgress(100);
      setSuccessCount(data.count ?? 0);
      setErrorCount(data.errors ?? 0);
      success(data.message || "Properties imported successfully", "Property Import");
      setStep("done");
    } catch (err) {
      notifyError(err, "Failed to import properties");
      setStep("upload");
    } finally {
      setImporting(false);
    }
  };

  const handlePasteDetect = async () => {
    if (!pasteText.trim()) {
      notifyError("Paste some Zillow listing text first.", "Paste Import");
      return;
    }
    setDetecting(true);
    try {
      const res = await apiPost<ParseResponse>("/properties/parse-paste", { text: pasteText });
      setDetected(res.data.listings || []);
      setSelected((res.data.listings || []).map((_, i) => i));
      if ((res.data.listings || []).length === 0) {
        notifyError("No properties detected. Copy listing text directly from a Zillow search and try again.", "Paste Import");
        setPasteStep("paste");
      } else {
        success(res.message, "Paste Import");
        setPasteStep("preview");
      }
    } catch (err) {
      notifyError(err, "Could not detect properties");
    } finally {
      setDetecting(false);
    }
  };

  const handlePasteImport = async () => {
    const chosen = detected.filter((_, i) => selected.includes(i));
    if (chosen.length === 0) {
      notifyError("Select at least one detected property to import.", "Paste Import");
      return;
    }
    setPasteImporting(true);
    try {
      const res = await apiPost<ImportPasteResponse>("/properties/import-paste", { listings: chosen });
      setPasteResult(res);
      success(res.message, "Paste Import");
      setPasteStep("done");
    } catch (err) {
      notifyError(err, "Import failed");
    } finally {
      setPasteImporting(false);
    }
  };

  return (
    <AdminLayout title="Import Properties">
      <div className="max-w-3xl mx-auto space-y-6">
        <HowTo
          title="How to Import Properties"
          summary="Bring listings in from a spreadsheet or paste them straight from a Zillow search."
          defaultOpen={step === "upload" && mode === "file"}
          requirements={[
            "A CSV or XLSX file with one property per row and a header row — or paste listing text from a Zillow search page.",
            "Title, description, price, address, city, state, and zip are required for every row.",
          ]}
          steps={[
            { text: "Choose an import method.", detail: "Upload a CSV/XLSX file, or switch to Paste Listings and copy rows straight from a Zillow search." },
            { text: "Match or review the detected fields.", detail: "File imports map columns; pasted listings are auto-parsed from the Zillow text." },
            { text: "Review the preview.", detail: "Rows missing a required field are skipped and listed with a reason after import." },
            "Confirm the import and review the summary.",
          ]}
        >
          <p className="rounded-lg bg-white/70 p-3 text-xs text-slate-600">
            <strong className="text-[#0A2647]">Property type text (e.g. &quot;House&quot;, &quot;Condo&quot;)</strong> is
            matched to your existing property types automatically. Imported listings land as drafts
            in <a href="/admin/properties/pending" className="underline">Pending Review</a> — nothing goes live
            until you approve it.
          </p>
        </HowTo>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setMode("file")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${mode === "file" ? "bg-white text-[#0A2647] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Upload File
          </button>
          <button
            onClick={() => setMode("paste")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${mode === "paste" ? "bg-white text-[#0A2647] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Paste Listings
          </button>
        </div>

        {mode === "file" && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {["upload", "mapping", "preview", "done"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s || (["upload", "mapping", "preview", "done"].indexOf(step) > i) ? "bg-[#C9A227] text-[#0A2647]" : "bg-slate-200 text-slate-500"}`}>
                {["upload", "mapping", "preview", "done"].indexOf(step) > i ? "✓" : i + 1}
              </div>
              <span className={`capitalize ${step === s ? "text-[#0A2647] font-semibold" : ""}`}>{s}</span>
              {i < 3 && <div className="w-8 h-px bg-slate-200" />}
            </div>
          ))}
        </div>
        )}

        {mode === "file" && step === "upload" && (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition ${dragOver ? "border-[#C9A227] bg-[#C9A227]/5" : "border-slate-300 hover:border-slate-400"}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-slate-700">Drop your file here</p>
            <p className="text-sm text-slate-400 mt-1">Supports CSV, XLSX, JSON files</p>
            <button onClick={() => fileRef.current?.click()} className="mt-4 px-6 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0d3366] transition">
              Browse Files
            </button>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.json" onChange={handleFileSelect} className="hidden" />
          </div>
        )}

        {mode === "file" && step === "mapping" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-2">Map Columns</h3>
            <p className="text-sm text-slate-500 mb-6">File: {file?.name}</p>
            <div className="space-y-3">
              {PROPERTY_FIELDS.map((col) => (
                <div key={col.key} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700 w-52">
                    {col.label} {col.required && <span className="text-red-500">*</span>}
                  </span>
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <select
                    value={mappings[col.key] || ""}
                    onChange={(e) => handleMappingChange(col.key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none bg-white"
                  >
                    <option value="">-- Skip Field --</option>
                    {fileHeaders.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${mappings[col.key] ? "bg-green-100 text-green-700 font-medium" : "bg-slate-100 text-slate-500"}`}>
                    {mappings[col.key] ? "Mapped" : "Unmapped"}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep("upload")} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Back</button>
              <button
                onClick={() => {
                  if (requiredFieldsMissing()) return;
                  setStep("preview");
                }}
                className="px-6 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition"
              >
                Preview Import
              </button>
            </div>
          </div>
        )}

        {mode === "file" && step === "preview" && (
          <div className="space-y-4">
            {importing && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-[#0A2647] mb-4">Importing...</h3>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#C9A227] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-sm text-slate-500 mt-2">{progress}% complete</p>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-[#0A2647]">Preview ({previewData.length} records)</h3>
              </div>
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">City / State</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{mappings.title ? row[mappings.title] : "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{mappings.price ? row[mappings.price] : "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {mappings.city ? row[mappings.city] : "—"}{mappings.state ? `, ${row[mappings.state]}` : ""}
                      </td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full capitalize">{mappings.property_type ? row[mappings.property_type] : "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep("mapping")} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Back</button>
              <button onClick={handleImport} disabled={importing} className="px-6 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
                {importing ? "Importing..." : "Confirm Import"}
              </button>
            </div>
          </div>
        )}

        {mode === "file" && step === "done" && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#0A2647] mb-2">Import Complete!</h3>
            <p className="text-slate-500 mb-1">{successCount} properties imported successfully</p>
            <p className="text-sm text-slate-400 mb-6">{errorCount} rows skipped — see Import History for details</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setStep("upload"); setFile(null); setProgress(0); }} className="px-6 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Import More</button>
              <a href="/admin/properties/pending" className="px-6 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#0d3366] transition">Review Imported Properties</a>
            </div>
          </div>
        )}

        {mode === "paste" && pasteStep === "paste" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-2">Paste Zillow Listings</h3>
            <p className="text-sm text-slate-500 mb-4">
              Copy rows straight from a Zillow search results page (each listing with its price,
              beds, baths, square feet, address, and photos) and paste them below. Properties are
              auto-detected — one listing per pasted block.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={10}
              placeholder={"https://www.zillow.com/homedetails/26504-79th-Ave-Glen-Oaks-NY-11004/32102264_zpid/\t$1,888,000\t3\tbds\t4\tba\t2,314\tsqft\tHouse for sale\t265-04 79th Avenue, Glen Oaks, NY 11004\tLISTING BY: BERKSHIRE HATHAWAY\t...\n\nPaste more listings below — each block becomes one property."}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none font-mono"
            />
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-slate-400">
                Imports land as <strong className="text-[#0A2647]">pending</strong> listings for review.
              </p>
              <button
                onClick={handlePasteDetect}
                disabled={detecting}
                className="px-6 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
              >
                {detecting ? "Detecting..." : "Detect Properties"}
              </button>
            </div>
          </div>
        )}

        {mode === "paste" && pasteStep === "preview" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-[#0A2647]">Detected ({detected.length} properties)</h3>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={selected.length === detected.length && detected.length > 0}
                    onChange={(e) => setSelected(e.target.checked ? detected.map((_, i) => i) : [])}
                    className="w-4 h-4 accent-[#C9A227]"
                  />
                  Select all
                </label>
              </div>
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold w-10"></th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Address</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Beds / Baths / Sqft</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Photos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detected.map((l, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(i)}
                          onChange={(e) => {
                            setSelected((prev) =>
                              e.target.checked
                                ? [...prev, i]
                                : prev.filter((x) => x !== i)
                            );
                          }}
                          className="w-4 h-4 accent-[#C9A227]"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {[l.address, l.city, l.state, l.zip].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {l.price != null && l.price !== "" ? `$${Number(l.price).toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {`${l.bedrooms ?? "—"} bd · ${l.bathrooms ?? "—"} ba · ${l.sqft ? Number(l.sqft).toLocaleString() : "—"} sqft`}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{Array.isArray(l.photos) ? l.photos.length : 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between">
              <button onClick={() => { setPasteStep("paste"); setDetected([]); }} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Back</button>
              <button
                onClick={handlePasteImport}
                disabled={pasteImporting}
                className="px-6 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
              >
                {pasteImporting
                  ? "Importing..."
                  : `Import ${selected.length} Propert${selected.length === 1 ? "y" : "ies"}`}
              </button>
            </div>
          </div>
        )}

        {mode === "paste" && pasteStep === "done" && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#0A2647] mb-2">Import Complete!</h3>
            <p className="text-slate-500 mb-1">
              {pasteResult?.count ?? 0} properties imported successfully
            </p>
            <p className="text-sm text-slate-400 mb-6">
              {pasteResult?.errors ?? 0} rows skipped — see Import History for details
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setPasteStep("paste"); setPasteText(""); setDetected([]); setSelected([]); setPasteResult(null); }}
                className="px-6 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Import More
              </button>
              <a href="/admin/properties/pending" className="px-6 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#0d3366] transition">Review Imported Properties</a>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
