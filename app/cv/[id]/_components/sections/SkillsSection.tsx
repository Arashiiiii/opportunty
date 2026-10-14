"use client";
import { useCVStore } from "../../../_store/cv-store";
import { Field, Area, AddBtn, RemoveBtn, ItemCard } from "../_form-utils";
import { useUI } from "@/app/_lib/useUiLang";

export function SkillsSection() {
  const skills         = useCVStore((s) => s.cv.skills);
  const updatePath     = useCVStore((s) => s.updatePath);
  const addSkillGroup  = useCVStore((s) => s.addSkillGroup);
  const removeSkillGroup = useCVStore((s) => s.removeSkillGroup);

  const { u } = useUI();
  return (
    <div>
      {skills.map((g) => (
        <ItemCard key={g.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", flex: 1 }}>{g.group || u.group}</span>
            <RemoveBtn onClick={() => removeSkillGroup(g.id)} />
          </div>

          <Field label={u.group} value={g.group} onChange={(v) => updatePath(`skills.${g.id}.group`, v)}
            placeholder="Design, Outils & code…" />
          <Area label={u.skillsList}
            value={g.items.join(", ")}
            onChange={(v) => updatePath(`skills.${g.id}.items`, v.split(",").map((x) => x.trim()).filter(Boolean))}
            rows={2}
            placeholder="Figma, Prototypage, Recherche utilisateur…" />
        </ItemCard>
      ))}

      <AddBtn label={u.addGroup} onClick={addSkillGroup} />
    </div>
  );
}
