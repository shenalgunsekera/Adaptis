"use client";

import { useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import { clientStorage, isClientConfigured } from "@/lib/firebase/client";

/* ============================================================================
   Image field.

   Uploads to Firebase Storage and stores the resulting URL. Alt text sits
   beside the file and is required whenever there is an image: the brand check
   refuses a page with an image and no alt text.

   The credit line is for licensed stock. The hero and case figures ship with
   no photography, and the module grammar stands in until a file is added
   here, so the site is correct before anything is licensed.
   ========================================================================= */

interface Img {
  src: string;
  alt: string;
  credit?: string;
}

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];

export function ImageField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: Img;
  onChange: (next: Img) => void;
}) {
  const img = value ?? { src: "", alt: "", credit: "" };
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);

    if (!ALLOWED.includes(file.type)) {
      setError("That file type is not supported. Use JPEG, PNG, WebP, AVIF or SVG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 8MB.`);
      return;
    }
    if (!isClientConfigured) {
      setError("Firebase Storage is not configured in this environment.");
      return;
    }

    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
    const path = `site/${Date.now()}-${safe}`;
    const task = uploadBytesResumable(ref(clientStorage(), path), file, {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    });

    setProgress(0);
    task.on(
      "state_changed",
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => {
        setProgress(null);
        setError(err.message || "The upload failed.");
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setProgress(null);
        onChange({ ...img, src: url });
      }
    );
  }

  return (
    <div className="adm__field">
      <span className="adm__label">{label}</span>
      {hint ? <p className="adm__hint">{hint}</p> : null}

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 4 }}>
        <div
          style={{
            width: 92,
            height: 70,
            flex: "0 0 auto",
            border: "1px solid var(--hairline)",
            background: "var(--page)",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          {img.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img.src}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span className="adm__hint" style={{ textAlign: "center", padding: 4 }}>
              Modules
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 6 }}>
          <input
            className="adm__input"
            placeholder="Image address, or upload a file"
            aria-label={`${label} address`}
            value={img.src}
            onChange={(e) => onChange({ ...img, src: e.target.value })}
          />

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <input
              ref={fileRef}
              type="file"
              accept={ALLOWED.join(",")}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="adm__btn adm__btn--sm"
              onClick={() => fileRef.current?.click()}
              disabled={progress !== null}
            >
              {progress !== null ? `Uploading ${progress}%` : "Upload"}
            </button>
            {img.src ? (
              <button
                type="button"
                className="adm__btn adm__btn--quiet adm__btn--sm"
                onClick={() => onChange({ ...img, src: "" })}
              >
                Remove, use modules
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <p className="adm__hint" style={{ color: "var(--fail)" }}>
          {error}
        </p>
      ) : null}

      <input
        className="adm__input"
        style={{ marginTop: 6 }}
        placeholder={img.src ? "Alt text — required" : "Alt text"}
        aria-label={`${label} alt text`}
        value={img.alt}
        onChange={(e) => onChange({ ...img, alt: e.target.value })}
      />
      {img.src && !img.alt.trim() ? (
        <p className="adm__hint" style={{ color: "var(--fail)" }}>
          This image needs alt text before the page will save.
        </p>
      ) : null}

      <input
        className="adm__input"
        style={{ marginTop: 6 }}
        placeholder="Credit or licence, for stock photography"
        aria-label={`${label} credit`}
        value={img.credit ?? ""}
        onChange={(e) => onChange({ ...img, credit: e.target.value })}
      />
    </div>
  );
}
