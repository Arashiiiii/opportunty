/**
 * TemplateThumb — real screenshots of each of the 10 templates
 * (public/templates/<id>.png, pulled from Reda's Drive folder), cropped
 * to the header so the strip stays compact while still showing exactly
 * what the template looks like.
 */
import type { TemplateId } from "./cv/_lib/schema";

export function TemplateThumb({ id }: { id: TemplateId; accent?: string }) {
  return (
    <img
      src={`/templates/${id}.png`}
      alt=""
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
    />
  );
}
