import assert from "node:assert/strict";
import test from "node:test";

import {
  escapeXml,
  renderCard,
  rotationIndex,
} from "../scripts/render-daily-rotation.mjs";

test("rotation advances once per UTC day and wraps", () => {
  assert.equal(rotationIndex(new Date("1970-01-01T23:59:59Z"), 3), 0);
  assert.equal(rotationIndex(new Date("1970-01-02T00:00:00Z"), 3), 1);
  assert.equal(rotationIndex(new Date("1970-01-04T00:00:00Z"), 3), 0);
});

test("XML content is escaped", () => {
  assert.equal(escapeXml(`A & B < "C"`), "A &amp; B &lt; &quot;C&quot;");

  const card = renderCard(
    { artist: "A & B", track: "<Track>", accent: "#22d3ee" },
    "dark",
  );

  assert.match(card, /A &amp; B/);
  assert.match(card, /&lt;Track&gt;/);
  assert.doesNotMatch(card, /<Track>/);
});

test("theme variants use different foregrounds", () => {
  const track = { artist: "Artist", track: "Track", accent: "#22d3ee" };
  assert.notEqual(renderCard(track, "dark"), renderCard(track, "light"));
});
