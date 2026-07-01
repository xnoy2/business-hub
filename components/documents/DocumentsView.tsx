"use client";

import { useEffect, useState } from "react";
import { businesses, type BusinessId } from "@/lib/data";

type DocExt = "pdf" | "docx" | "xlsx" | "pptx" | "jpg";
type Category = "quotes" | "contracts" | "sops" | "reports" | "marketing" | "hr";
type CategoryFilter = "all" | Category;

export interface DocItem {
  id: string;
  name: string;
  ext: DocExt;
  category: Category;
  business: BusinessId;
  size: string;
  date: string;
  dataUrl?: string;
}

const STORAGE_KEY = "nxps_documents";

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all",       label: "All Documents" },
  { id: "quotes",    label: "Quotes & Proposals" },
  { id: "contracts", label: "Contracts" },
  { id: "sops",      label: "SOPs & Procedures" },
  { id: "reports",   label: "Reports" },
  { id: "marketing", label: "Marketing Assets" },
  { id: "hr",        label: "HR & Staff" },
];

const CAT_OPTIONS: { id: Category; label: string }[] = [
  { id: "quotes",    label: "Quotes & Proposals" },
  { id: "contracts", label: "Contracts" },
  { id: "sops",      label: "SOPs & Procedures" },
  { id: "reports",   label: "Reports" },
  { id: "marketing", label: "Marketing Assets" },
  { id: "hr",        label: "HR & Staff" },
];

const EXT_COLOR: Record<DocExt, string> = {
  pdf:  "bg-red-500/15   text-red-400",
  docx: "bg-blue-500/15  text-blue-400",
  xlsx: "bg-green-500/15 text-green-400",
  pptx: "bg-orange-500/15 text-orange-400",
  jpg:  "bg-purple-500/15 text-purple-400",
};

const BIZ_LABEL: Record<BusinessId, string> = { bgr: "BGR", bcf: "BCF", group: "Group" };
const BIZ_STYLE: Record<BusinessId, string> = {
  bgr:   "text-emerald-400 bg-emerald-400/10",
  bcf:   "text-sky-400     bg-sky-400/10",
  group: "text-gold        bg-gold/10",
};

const SEED: DocItem[] = [
  { id: "d1",  name: "GR-2026-045 – Quote for Gallagher",    ext: "pdf",  category: "quotes",    business: "bgr",   size: "284 KB",  date: "19 Jun 2026" },
  { id: "d2",  name: "GR-2026-044 – Installation Contract",   ext: "docx", category: "contracts", business: "bgr",   size: "118 KB",  date: "17 Jun 2026" },
  { id: "d3",  name: "Garden Room Design Specification v3",    ext: "pdf",  category: "sops",      business: "bgr",   size: "1.2 MB",  date: "10 Jun 2026" },
  { id: "d4",  name: "BGR Sales Pipeline – June 2026",         ext: "xlsx", category: "reports",   business: "bgr",   size: "96 KB",   date: "19 Jun 2026" },
  { id: "d5",  name: "Summer Campaign Brief",                  ext: "pptx", category: "marketing", business: "bgr",   size: "3.8 MB",  date: "5 Jun 2026"  },
  { id: "d6",  name: "Site Photography – Ballycastle",         ext: "jpg",  category: "marketing", business: "bgr",   size: "12.4 MB", date: "2 Jun 2026"  },
  { id: "d7",  name: "BCF-2026-118 – Playground Proposal",    ext: "pdf",  category: "quotes",    business: "bcf",   size: "421 KB",  date: "18 Jun 2026" },
  { id: "d8",  name: "BCF-2026-117 – Installation Contract",   ext: "docx", category: "contracts", business: "bcf",   size: "133 KB",  date: "15 Jun 2026" },
  { id: "d9",  name: "Safety Inspection Checklist v2",         ext: "pdf",  category: "sops",      business: "bcf",   size: "204 KB",  date: "8 Jun 2026"  },
  { id: "d10", name: "BCF Product Catalogue 2026",             ext: "pdf",  category: "marketing", business: "bcf",   size: "8.1 MB",  date: "1 Jun 2026"  },
  { id: "d11", name: "BCF Monthly Report – May 2026",          ext: "xlsx", category: "reports",   business: "bcf",   size: "88 KB",   date: "1 Jun 2026"  },
  { id: "d12", name: "NXPS Group – Q2 Board Pack",             ext: "pptx", category: "reports",   business: "group", size: "5.2 MB",  date: "14 Jun 2026" },
  { id: "d13", name: "Group Cashflow Forecast – 2026",         ext: "xlsx", category: "reports",   business: "group", size: "142 KB",  date: "12 Jun 2026" },
  { id: "d14", name: "Employee Handbook v4",                   ext: "pdf",  category: "hr",        business: "group", size: "634 KB",  date: "1 Jan 2026"  },
  { id: "d15", name: "Onboarding Checklist",                   ext: "docx", category: "hr",        business: "group", size: "72 KB",   date: "15 Mar 2026" },
  { id: "d16", name: "Brand Guidelines 2026",                  ext: "pdf",  category: "marketing", business: "group", size: "9.3 MB",  date: "15 Jan 2026" },
];

function today() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── Upload modal ──────────────────────────────────────────────────────────────
const EXT_FROM_MIME: Record<string, DocExt> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-excel": "xlsx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

function fmtSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadModal({
  onSave,
  onClose,
}: {
  onSave: (doc: DocItem) => void;
  onClose: () => void;
}) {
  const [name, setName]       = useState("");
  const [ext, setExt]         = useState<DocExt>("pdf");
  const [category, setCat]    = useState<Category>("quotes");
  const [business, setBiz]    = useState<BusinessId>("bgr");
  const [file, setFile]       = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string | undefined>(undefined);
  const [reading, setReading] = useState(false);
  const [sizeWarn, setSizeWarn] = useState(false);

  const MAX_STORE = 4 * 1024 * 1024; // 4 MB — localStorage budget

  const handleFile = (f: File) => {
    setFile(f);
    setSizeWarn(false);
    // Auto-fill name (strip extension) and type
    const dotIdx = f.name.lastIndexOf(".");
    setName(dotIdx > 0 ? f.name.slice(0, dotIdx) : f.name);
    const detected = EXT_FROM_MIME[f.type] ?? (f.name.split(".").pop()?.toLowerCase() as DocExt | undefined) ?? "pdf";
    setExt(detected as DocExt);

    if (f.size > MAX_STORE) {
      setSizeWarn(true);
      setDataUrl(undefined);
      return;
    }
    setReading(true);
    const reader = new FileReader();
    reader.onload = () => { setDataUrl(reader.result as string); setReading(false); };
    reader.onerror = () => { setDataUrl(undefined); setReading(false); };
    reader.readAsDataURL(f);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const save = () => {
    if (!name.trim()) return;
    onSave({
      id: `doc-${Date.now()}`,
      name: name.trim(),
      ext,
      category,
      business,
      size: file ? fmtSize(file.size) : "—",
      date: today(),
      dataUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-md p-6 z-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-ink">Upload Document</h2>
          <button onClick={onClose} className="text-muted hover:text-ink text-lg leading-none">&times;</button>
        </div>

        <div className="space-y-3">
          {/* File drop zone */}
          <label
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer transition
              ${file ? "border-gold/50 bg-gold/5" : "border-line hover:border-gold/40 hover:bg-white/[0.02]"}`}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input type="file" className="sr-only" onChange={onInputChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg" />
            {reading ? (
              <span className="w-5 h-5 rounded-full border-2 border-line border-t-gold animate-spin" />
            ) : file ? (
              <>
                <span className={`chip text-[11px] font-bold uppercase ${EXT_COLOR[ext]}`}>{ext}</span>
                <span className="text-[13px] text-ink-soft text-center break-all">{file.name}</span>
                <span className="text-[11px] text-faint">{fmtSize(file.size)}</span>
              </>
            ) : (
              <>
                <svg className="w-8 h-8 text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-[13px] text-muted">Drop file here or <span className="text-gold-bright">browse</span></span>
                <span className="text-[11px] text-faint">PDF, DOCX, XLSX, PPTX, JPG — max 4 MB for local storage</span>
              </>
            )}
          </label>

          {sizeWarn && (
            <p className="text-[12px] text-warn text-center">
              File is over 4 MB — it will be listed but Download won&apos;t work until cloud storage is connected.
            </p>
          )}

          <label className="block">
            <span className="text-[12.5px] text-muted block mb-1">Document name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="e.g. GR-2026-050 – Quote for Murphy"
              className="field-input w-full"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[12.5px] text-muted block mb-1">File type</span>
              <select value={ext} onChange={(e) => setExt(e.target.value as DocExt)} className="field-input w-full">
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="xlsx">XLSX</option>
                <option value="pptx">PPTX</option>
                <option value="jpg">JPG</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[12.5px] text-muted block mb-1">Category</span>
              <select value={category} onChange={(e) => setCat(e.target.value as Category)} className="field-input w-full">
                {CAT_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-[12.5px] text-muted block mb-1">Business</span>
            <select value={business} onChange={(e) => setBiz(e.target.value as BusinessId)} className="field-input w-full">
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={save} disabled={!name.trim() || reading} className="btn-gold flex-1 justify-center disabled:opacity-50">
            {reading ? "Reading file…" : "Add Document"}
          </button>
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-muted hover:text-ink border border-line rounded-lg transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit row ──────────────────────────────────────────────────────────────────
function EditRow({
  doc,
  onSave,
  onCancel,
}: {
  doc: DocItem;
  onSave: (updated: DocItem) => void;
  onCancel: () => void;
}) {
  const [name, setName]    = useState(doc.name);
  const [ext, setExt]      = useState<DocExt>(doc.ext);
  const [category, setCat] = useState<Category>(doc.category);
  const [business, setBiz] = useState<BusinessId>(doc.business);

  return (
    <div className="card px-4 py-3 border border-gold/30 space-y-3">
      <div className="flex flex-wrap gap-2">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSave({ ...doc, name, ext, category, business }); if (e.key === "Escape") onCancel(); }}
          className="field-input flex-1 min-w-[200px]"
        />
        <select value={ext} onChange={(e) => setExt(e.target.value as DocExt)} className="field-input w-24">
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
          <option value="xlsx">XLSX</option>
          <option value="pptx">PPTX</option>
          <option value="jpg">JPG</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <select value={category} onChange={(e) => setCat(e.target.value as Category)} className="field-input flex-1">
          {CAT_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={business} onChange={(e) => setBiz(e.target.value as BusinessId)} className="field-input w-44">
          {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button onClick={() => onSave({ ...doc, name, ext, category, business })} className="btn-gold px-4">Save</button>
        <button onClick={onCancel} className="px-3 py-2 text-[13px] text-muted hover:text-ink transition">Cancel</button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function DocumentsView({ businessId }: { businessId: BusinessId }) {
  const [docs, setDocs]           = useState<DocItem[]>([]);
  const [category, setCategory]   = useState<CategoryFilter>("all");
  const [bizFilter, setBizFilter] = useState<BusinessId | "all">("all");
  const [search, setSearch]       = useState("");
  const [view, setView]           = useState<"list" | "grid">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [toast, setToast]         = useState<string | null>(null);

  // Load from localStorage (seed on first visit)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setDocs(raw ? JSON.parse(raw) : SEED);
      if (!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
    } catch {
      setDocs(SEED);
    }
  }, []);

  const persist = (next: DocItem[]) => {
    setDocs(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const saveEdit = (updated: DocItem) => {
    persist(docs.map((d) => (d.id === updated.id ? updated : d)));
    setEditingId(null);
  };

  const confirmDelete = (id: string) => {
    persist(docs.filter((d) => d.id !== id));
    setDeleteId(null);
  };

  const addDoc = (doc: DocItem) => {
    persist([doc, ...docs]);
    setShowUpload(false);
  };

  const handleDownload = (doc: DocItem) => {
    if (doc.dataUrl) {
      const a = document.createElement("a");
      a.href = doc.dataUrl;
      a.download = `${doc.name}.${doc.ext}`;
      a.click();
    } else {
      setToast(`"${doc.name}" — no file attached. Re-upload with a file to enable download.`);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const visible = docs.filter((d) => {
    if (category !== "all" && d.category !== category) return false;
    if (bizFilter !== "all" && d.business !== bizFilter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      {showUpload && <UploadModal onSave={addDoc} onClose={() => setShowUpload(false)} />}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative card w-full max-w-sm p-6 z-10 text-center space-y-4">
            <p className="text-[15px] font-semibold text-ink">Delete document?</p>
            <p className="text-[13px] text-muted">
              &ldquo;{docs.find((d) => d.id === deleteId)?.name}&rdquo; will be removed from the list.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => confirmDelete(deleteId)}
                className="flex-1 py-2 rounded-xl bg-neg/10 border border-neg/30 text-neg text-[13px] font-medium hover:bg-neg/20 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-xl border border-line text-muted text-[13px] hover:text-ink transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-elevated border border-line-strong shadow-2xl text-[13px] text-ink-soft max-w-sm text-center">
          {toast}
        </div>
      )}

      <div className="rise flex gap-6">
        {/* Category sidebar */}
        <aside className="w-48 shrink-0 space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-faint px-3 mb-3">Categories</p>
          {CATEGORIES.map((c) => {
            const count = c.id === "all" ? docs.length : docs.filter((d) => d.category === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition ${
                  category === c.id
                    ? "bg-gold/10 text-gold-bright font-medium"
                    : "text-muted hover:text-ink-soft hover:bg-white/[0.03]"
                }`}
              >
                <span>{c.label}</span>
                <span className="text-[11px] text-faint tabular-nums">{count}</span>
              </button>
            );
          })}
        </aside>

        {/* Main area */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[24px] font-semibold tracking-tight text-ink">Documents</h1>
              <p className="text-sm text-muted mt-0.5">
                {visible.length} document{visible.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <button onClick={() => setShowUpload(true)} className="btn-gold gap-2 shrink-0">
              + Upload
            </button>
          </div>

          {/* Search + filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="field-input flex-1 min-w-[200px]"
            />
            <div className="flex rounded-lg border border-line overflow-hidden text-[12.5px]">
              {(["all", "bgr", "bcf", "group"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBizFilter(b)}
                  className={`px-3 py-1.5 transition ${
                    bizFilter === b ? "bg-gold/15 text-gold-bright" : "text-muted hover:text-ink-soft"
                  }`}
                >
                  {b === "all" ? "All" : BIZ_LABEL[b as BusinessId]}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-line overflow-hidden text-[12.5px]">
              {(["list", "grid"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 capitalize transition ${
                    view === v ? "bg-gold/15 text-gold-bright" : "text-muted hover:text-ink-soft"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Document list */}
          {visible.length === 0 ? (
            <div className="card p-10 text-center text-muted text-sm">
              No documents match your search.{" "}
              <button onClick={() => setShowUpload(true)} className="text-gold-bright hover:underline">
                Add one?
              </button>
            </div>
          ) : view === "list" ? (
            <div className="space-y-2">
              {visible.map((doc) =>
                editingId === doc.id ? (
                  <EditRow
                    key={doc.id}
                    doc={doc}
                    onSave={saveEdit}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div
                    key={doc.id}
                    className="card px-4 py-3 flex items-center gap-4 group hover:border-line-strong transition"
                  >
                    <span className={`chip text-[11px] font-semibold uppercase w-10 text-center shrink-0 ${EXT_COLOR[doc.ext]}`}>
                      {doc.ext}
                    </span>
                    <span className="flex-1 text-[13.5px] text-ink-soft truncate">{doc.name}</span>
                    <span className={`chip text-[11px] shrink-0 ${BIZ_STYLE[doc.business]}`}>
                      {BIZ_LABEL[doc.business]}
                    </span>
                    <span className="text-[12px] text-faint w-16 text-right tabular-nums shrink-0">{doc.size}</span>
                    <span className="text-[12px] text-faint w-24 text-right shrink-0">{doc.date}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-3 transition shrink-0">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="text-[12px] text-info hover:underline"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => setEditingId(doc.id)}
                        className="text-[12px] text-gold-bright hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(doc.id)}
                        className="text-[12px] text-neg hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visible.map((doc) => (
                <div
                  key={doc.id}
                  className="card p-4 flex flex-col gap-3 hover:border-line-strong transition group"
                >
                  <div className={`w-10 h-10 rounded-lg grid place-items-center text-sm font-bold uppercase ${EXT_COLOR[doc.ext]}`}>
                    {doc.ext}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-ink-soft font-medium leading-snug line-clamp-2">{doc.name}</p>
                    <p className="text-[11px] text-faint mt-1">{doc.size} · {doc.date}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`chip text-[11px] ${BIZ_STYLE[doc.business]}`}>
                      {BIZ_LABEL[doc.business]}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="text-[11px] text-info hover:underline"
                      >
                        DL
                      </button>
                      <button
                        onClick={() => { setView("list"); setEditingId(doc.id); }}
                        className="text-[11px] text-gold-bright hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(doc.id)}
                        className="text-[11px] text-neg hover:underline"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
