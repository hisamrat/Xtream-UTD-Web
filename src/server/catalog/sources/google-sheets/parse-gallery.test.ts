import { describe, expect, it } from "vitest";
import { parseAspectRatio, parseGallerySheet, parseMediaType } from "./parse-gallery";
import { normalizeHeader, parseBoolean, parseKeyValueList, parseLooseNumber, pipeSplit } from "./table";

describe("parseGallerySheet", () => {
  const rows = [
    ["Slug", "Title", "Media Type", "Media URL", "Poster URL", "Aspect Ratio", "Active"],
    ["desk-lamp", "Lamp video", "", "https://youtu.be/dQw4w9WgXcQ", "", "9:16", ""],
    ["", "Photo", "image", "https://drive.google.com/file/d/1molKCmrmkbMbY_Y3KiWoxqRG9pu7wfIZ/view", "", "", "TRUE"],
    ["hidden", "Hidden", "", "https://example.com/x.jpg", "", "", "FALSE"],
    ["", "", "", "", "", "", ""]
  ];

  it("parses active rows, detects videos, and keeps YouTube links as-is", () => {
    const items = parseGallerySheet(rows);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      id: "gallery-desk-lamp",
      mediaType: "video",
      mediaUrl: "https://youtu.be/dQw4w9WgXcQ",
      aspectRatio: 9 / 16
    });
    expect(items[1]).toMatchObject({
      id: "gallery-2",
      title: "Photo",
      mediaType: "image",
      mediaUrl: "https://lh3.googleusercontent.com/d/1molKCmrmkbMbY_Y3KiWoxqRG9pu7wfIZ",
      aspectRatio: 0.8
    });
  });

  it("returns an empty list without a recognizable header", () => {
    expect(parseGallerySheet([["nothing"]])).toEqual([]);
  });
});

describe("cell parsers", () => {
  it("parses aspect ratios and media types", () => {
    expect(parseAspectRatio("4/5")).toBe(0.8);
    expect(parseAspectRatio("1.5")).toBe(1.5);
    expect(parseAspectRatio("abc")).toBe(0.8);
    expect(parseMediaType("", "https://cdn.example.com/clip.mp4")).toBe("video");
    expect(parseMediaType("Image", "https://example.com/a.jpg")).toBe("image");
  });

  it("parses headers, lists, booleans and loose numbers", () => {
    expect(normalizeHeader(" Old Price (BDT) ")).toBe("old_price_bdt");
    expect(pipeSplit(" a | | b ")).toEqual(["a", "b"]);
    expect(parseKeyValueList("Size: M | invalid | Weight: 2kg")).toEqual({ Size: "M", Weight: "2kg" });
    expect(parseBoolean("true")).toBe(true);
    expect(parseBoolean("maybe", true)).toBe(true);
    expect(parseLooseNumber("৳1,290", 0)).toBe(1290);
    expect(parseLooseNumber("", 7)).toBe(7);
  });
});
