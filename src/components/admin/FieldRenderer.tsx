"use client";

import { useId, useState } from "react";

import type { FieldDef } from "./fields";
import { ImageField } from "./ImageField";

/* ============================================================================
   Renders one field descriptor as an input, recursing for repeated groups.

   Values are plain data, edited immutably and handed back whole, so the page
   editor keeps a single source of truth it can save, revert, or re-check
   against the brand rules.
   ========================================================================= */

type Value = Record<string, unknown>;

function get(obj: Value, key: string): unknown {
  return obj?.[key];
}

function set(obj: Value, key: string, value: unknown): Value {
  return { ...obj, [key]: value };
}

export function Fields({
  defs,
  value,
  onChange,
}: {
  defs: FieldDef[];
  value: Value;
  onChange: (next: Value) => void;
}) {
  return (
    <>
      {defs.map((def) => (
        <Field
          key={def.k}
          def={def}
          value={get(value, def.k)}
          onChange={(v) => onChange(set(value, def.k, v))}
        />
      ))}
    </>
  );
}

function Field({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const id = useId();

  switch (def.type) {
    case "text":
      return (
        <div className="adm__field">
          <label className="adm__label" htmlFor={id}>
            {def.label}
          </label>
          <input
            id={id}
            className="adm__input"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          {def.hint ? <p className="adm__hint">{def.hint}</p> : null}
        </div>
      );

    case "textarea": {
      const text = (value as string) ?? "";
      return (
        <div className="adm__field">
          <label className="adm__label" htmlFor={id}>
            {def.label}
          </label>
          <textarea
            id={id}
            className="adm__textarea"
            value={text}
            onChange={(e) => onChange(e.target.value)}
          />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            {def.hint ? <p className="adm__hint">{def.hint}</p> : <span />}
            <span className="adm__count">{text.length} characters</span>
          </div>
        </div>
      );
    }

    case "number":
      return (
        <div className="adm__field">
          <label className="adm__label" htmlFor={id}>
            {def.label}
          </label>
          <input
            id={id}
            className="adm__input"
            type="number"
            value={Number(value ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          {def.hint ? <p className="adm__hint">{def.hint}</p> : null}
        </div>
      );

    case "bool":
      return (
        <div className="adm__field">
          <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="adm__label" style={{ margin: 0 }}>
              {def.label}
            </span>
          </label>
          {def.hint ? <p className="adm__hint">{def.hint}</p> : null}
        </div>
      );

    case "select":
      return (
        <div className="adm__field">
          <label className="adm__label" htmlFor={id}>
            {def.label}
          </label>
          <select
            id={id}
            className="adm__select"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          >
            {def.options.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
          {def.hint ? <p className="adm__hint">{def.hint}</p> : null}
        </div>
      );

    case "strings":
      return (
        <StringList
          label={def.label}
          itemLabel={def.itemLabel ?? "Item"}
          hint={def.hint}
          items={(value as string[]) ?? []}
          onChange={(next) => onChange(next)}
        />
      );

    case "image":
      return (
        <ImageField
          label={def.label}
          hint={def.hint}
          value={(value as { src: string; alt: string; credit?: string }) ?? { src: "", alt: "" }}
          onChange={onChange}
        />
      );

    case "cta": {
      const cta = (value as { label: string; href: string }) ?? { label: "", href: "" };
      return (
        <div className="adm__field">
          <span className="adm__label">{def.label}</span>
          <div className="adm__grid2">
            <input
              className="adm__input"
              placeholder="Label"
              aria-label={`${def.label} label`}
              value={cta.label ?? ""}
              onChange={(e) => onChange({ ...cta, label: e.target.value })}
            />
            <input
              className="adm__input"
              placeholder="/contact"
              aria-label={`${def.label} address`}
              value={cta.href ?? ""}
              onChange={(e) => onChange({ ...cta, href: e.target.value })}
            />
          </div>
          {def.hint ? <p className="adm__hint">{def.hint}</p> : null}
        </div>
      );
    }

    case "list":
      return (
        <ObjectList
          def={def}
          items={(value as Value[]) ?? []}
          onChange={(next) => onChange(next)}
        />
      );

    default:
      return null;
  }
}

/* --- A list of plain strings ------------------------------------------------ */

function StringList({
  label,
  itemLabel,
  hint,
  items,
  onChange,
}: {
  label: string;
  itemLabel: string;
  hint?: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="adm__field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span className="adm__label">
          {label} <span className="adm__count">({items.length})</span>
        </span>
        <button
          type="button"
          className="adm__btn adm__btn--sm"
          onClick={() => onChange([...items, ""])}
        >
          Add {itemLabel.toLowerCase()}
        </button>
      </div>
      {hint ? <p className="adm__hint">{hint}</p> : null}

      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "flex-start" }}>
          <span className="adm__repeat__n" style={{ paddingTop: 10, minWidth: 22 }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <textarea
            className="adm__textarea"
            style={{ minHeight: 58 }}
            aria-label={`${itemLabel} ${i + 1}`}
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <div style={{ display: "grid", gap: 2 }}>
            <button
              type="button"
              className="adm__btn adm__btn--quiet adm__btn--sm"
              aria-label={`Move ${itemLabel.toLowerCase()} ${i + 1} up`}
              disabled={i === 0}
              onClick={() => {
                const next = [...items];
                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                onChange(next);
              }}
            >
              ↑
            </button>
            <button
              type="button"
              className="adm__btn adm__btn--quiet adm__btn--sm"
              aria-label={`Move ${itemLabel.toLowerCase()} ${i + 1} down`}
              disabled={i === items.length - 1}
              onClick={() => {
                const next = [...items];
                [next[i + 1], next[i]] = [next[i], next[i + 1]];
                onChange(next);
              }}
            >
              ↓
            </button>
            <button
              type="button"
              className="adm__btn adm__btn--quiet adm__btn--sm"
              aria-label={`Remove ${itemLabel.toLowerCase()} ${i + 1}`}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* --- A list of objects, each with its own field set ------------------------- */

function ObjectList({
  def,
  items,
  onChange,
}: {
  def: Extract<FieldDef, { type: "list" }>;
  items: Value[];
  onChange: (next: Value[]) => void;
}) {
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });

  return (
    <div className="adm__field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span className="adm__label">
          {def.label} <span className="adm__count">({items.length})</span>
        </span>
        <button
          type="button"
          className="adm__btn adm__btn--sm"
          onClick={() => {
            onChange([...items, def.newItem()]);
            setOpen((o) => ({ ...o, [items.length]: true }));
          }}
        >
          Add {def.itemLabel.toLowerCase()}
        </button>
      </div>
      {def.hint ? <p className="adm__hint">{def.hint}</p> : null}

      {items.map((item, i) => {
        const title = String(item[def.titleKey] ?? "") || `${def.itemLabel} ${i + 1}`;
        const isOpen = open[i] ?? false;

        return (
          <div key={String(item.id ?? i)} className="adm__repeat">
            <div className="adm__repeat__head">
              <span className="adm__repeat__n">{String(i + 1).padStart(2, "0")}</span>
              <button
                type="button"
                className="adm__btn adm__btn--quiet adm__btn--sm"
                aria-expanded={isOpen}
                onClick={() => setOpen((o) => ({ ...o, [i]: !isOpen }))}
                style={{ fontWeight: 600 }}
              >
                {isOpen ? "▾" : "▸"} {title}
              </button>

              <div className="adm__section__tools">
                <button
                  type="button"
                  className="adm__btn adm__btn--quiet adm__btn--sm"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => {
                    const next = [...items];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    onChange(next);
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="adm__btn adm__btn--quiet adm__btn--sm"
                  aria-label="Move down"
                  disabled={i === items.length - 1}
                  onClick={() => {
                    const next = [...items];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    onChange(next);
                  }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="adm__btn adm__btn--danger adm__btn--sm"
                  onClick={() => {
                    if (!window.confirm(`Remove "${title}"? This cannot be undone once saved.`)) return;
                    onChange(items.filter((_, j) => j !== i));
                  }}
                >
                  Remove
                </button>
              </div>
            </div>

            {isOpen ? (
              <Fields
                defs={def.fields}
                value={item}
                onChange={(next) => {
                  const arr = [...items];
                  arr[i] = next;
                  onChange(arr);
                }}
              />
            ) : null}
          </div>
        );
      })}

      {items.length === 0 ? <p className="adm__empty">Nothing here yet.</p> : null}
    </div>
  );
}
