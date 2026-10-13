import { describe, expect, it } from "vitest";
import { collectImageCandidates, extractGoogleDriveFileId, getImageCandidates, IMAGE_WIDTHS } from "./google-drive";

const ID = "1molKCmrmkbMbY_Y3KiWoxqRG9pu7wfIZ";

describe("Google Drive image candidates", () => {
  it("requests a resized JPEG first, then the resized original, thumbnail and full file", () => {
    expect(getImageCandidates(`https://drive.google.com/file/d/${ID}/view?usp=sharing`, 600)).toEqual([
      `https://lh3.googleusercontent.com/d/${ID}=w600-rj`,
      `https://lh3.googleusercontent.com/d/${ID}=w600`,
      `https://drive.google.com/thumbnail?id=${ID}&sz=w600`,
      `https://lh3.googleusercontent.com/d/${ID}`,
      `https://drive.google.com/uc?export=view&id=${ID}`
    ]);
  });

  it("defaults to the card width and reads ids from already-sized CDN links", () => {
    expect(getImageCandidates(`https://lh3.googleusercontent.com/d/${ID}=w800`)[0]).toBe(
      `https://lh3.googleusercontent.com/d/${ID}=w${IMAGE_WIDTHS.card}-rj`
    );
    expect(extractGoogleDriveFileId(`https://lh3.googleusercontent.com/d/${ID}=w800-rj`)).toBe(ID);
  });

  it("leaves non-Drive URLs untouched and ignores folders", () => {
    expect(getImageCandidates("https://cdn.example.com/a.jpg", 600)).toEqual(["https://cdn.example.com/a.jpg"]);
    expect(getImageCandidates("https://drive.google.com/drive/folders/abc")).toEqual([]);
  });

  it("de-duplicates candidates across sources", () => {
    const urls = collectImageCandidates([ID, `https://lh3.googleusercontent.com/d/${ID}`], 360);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls[0]).toBe(`https://lh3.googleusercontent.com/d/${ID}=w360-rj`);
  });
});
