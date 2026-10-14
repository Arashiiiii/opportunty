"use client";
import { useCVStore } from "../../../_store/cv-store";
import { Field, AddBtn, RemoveBtn, ItemCard, TWO_COL } from "../_form-utils";
import { useUI } from "@/app/_lib/useUiLang";

export function CertsSection() {
  const certs      = useCVStore((s) => s.cv.certifications);
  const updatePath = useCVStore((s) => s.updatePath);
  const addCert    = useCVStore((s) => s.addCert);
  const removeCert = useCVStore((s) => s.removeCert);

  const { u } = useUI();
  return (
    <div>
      {certs.map((c) => (
        <ItemCard key={c.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", flex: 1 }}>{c.name || u.certification}</span>
            <RemoveBtn onClick={() => removeCert(c.id)} />
          </div>
          <Field label={u.name} value={c.name} onChange={(v) => updatePath(`certifications.${c.id}.name`, v)}
            placeholder="Nielsen Norman UX Master" />
          <div style={TWO_COL}>
            <Field label={u.issuer} value={c.issuer ?? ""} onChange={(v) => updatePath(`certifications.${c.id}.issuer`, v)} placeholder="NN/g" />
            <Field label={u.year}    value={c.year  ?? ""} onChange={(v) => updatePath(`certifications.${c.id}.year`,   v)} placeholder="2024" />
          </div>
        </ItemCard>
      ))}

      <AddBtn label={u.addCert} onClick={addCert} />
    </div>
  );
}
