"use client";

import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/Toast";
import HowTo from "@/components/ui/HowTo";
import { API_BASE } from "@/lib/api";

export default function ImportPropertiesPage() {
  const { success, notifyError } = useToast();
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

  const PROPERTY_FIELDS = [
    { key: "title", label: "Property Title", required: true },
    { key: "description", label: "Description", required: true },
    { key: "price", label: "Price", required: true },
    { key: "address", label: "Street Address", required: true },
    { key: "city", label: "City", required: true },
    { key: "state", label: "State", required: true },
    { key: "zip", label: "Zip Code", required: true },
    { key: "bedrooms", label: "Bedrooms", required: false },
    { key: "bathrooms", label: "Bathrooms", required: false },
    { key: "sqft", label: "Square Feet", required: false },
    { key: "property_type", label: "Property Type (e.g. House, Condo)", required: false },
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
          // Parse CSV lines
          const lines = text.split("\n");
          if (lines.length > 0) {
            headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
            for (let i = 1; i < Math.min(lines.length, 6); i++) {
              if (!lines[i].trim()) continue;
              const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
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

  return (
    <AdminLayout title="Import Properties">
      <div className="max-w-3xl mx-auto space-y-6">
        <HowTo
          title="How to Import Properties"
          summary="Bring listings in from a spreadsheet and map them to property fields."
          defaultOpen={step === "upload"}
          requirements={[
            "A CSV or XLSX file with one property per row and a header row.",
            "Title, description, price, address, city, state, and zip are required for every row.",
          ]}
          steps={[
            { text: "Upload a CSV or XLSX file.", detail: "Maximum 10 MB. The first row is treated as column headers." },
            { text: "Match your file columns to property fields.", detail: "Columns are auto-detected from header names — you don't need exact matches." },
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

        {step === "upload" && (
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

        {step === "mapping" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-2">Map Columns</h3>
            <p className="text-sm text-slate-500 mb-6">File: {file?.name}</p>
            <div className="space-y-3">
              {PROPERTY_FIELDS.map((col) => (
                <div key={col.key} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-750 w-52">
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

        {step === "preview" && (
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

        {step === "done" && (
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
      </div>
    </AdminLayout>
  );
}
