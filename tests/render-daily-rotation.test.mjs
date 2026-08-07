import assert from "node:assert/strict";
import test from "node:test";
import { escapeXml, fitTitle, renderCard, rotationIndex } from "../scripts/render-daily-rotation.mjs";

test("rotation advances by UTC day and wraps", () => {
  assert.equal(rotationIndex(new Date("1970-01-01T23:59:59Z"), 3), 0);
  assert.equal(rotationIndex(new Date("1970-01-04T00:00:00Z"), 3), 0);
});

test("content is escaped and themes differ", () => {
  assert.equal(escapeXml("A & <B>"), "A &amp; &lt;B&gt;");
  const track = { artist: "A & B", track: "Track", accent: "#22d3ee" };
  assert.match(renderCard(track, "dark"), /A &amp; B/);
  assert.notEqual(renderCard(track, "dark"), renderCard(track, "light"));
});

test("long titles shrink and truncate", () => {
  assert.deepEqual(fitTitle("Short title"), { title: "Short title", size: 24 });
  const fitted = fitTitle("A title that is deliberately far too long for the available card width");
  assert.equal(fitted.size, 18);
  assert.ok(fitted.title.length <= 46);
});
