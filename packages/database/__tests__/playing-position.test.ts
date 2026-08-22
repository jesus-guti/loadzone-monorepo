import { describe, expect, it } from "vitest";

import {
  formatPlayingPositionCromoLine,
  optionalPlayingPositionSchema,
  PLAYING_POSITIONS,
  PLAYING_POSITION_STAFF_LABEL,
  playingPositionSchema,
} from "../playing-position";

describe("playingPositionSchema", () => {
  it("accepts the four coarse lines", () => {
    expect(PLAYING_POSITIONS).toEqual(["POR", "DEF", "MED", "DEL"]);
    for (const value of PLAYING_POSITIONS) {
      expect(playingPositionSchema.parse(value)).toBe(value);
    }
  });

  it("rejects fine pitch slots and unknown values", () => {
    expect(playingPositionSchema.safeParse("GK").success).toBe(false);
    expect(playingPositionSchema.safeParse("CM").success).toBe(false);
    expect(playingPositionSchema.safeParse("").success).toBe(false);
  });
});

describe("optionalPlayingPositionSchema", () => {
  it("maps clear / empty to null", () => {
    expect(optionalPlayingPositionSchema.parse(undefined)).toBeNull();
    expect(optionalPlayingPositionSchema.parse("")).toBeNull();
    expect(optionalPlayingPositionSchema.parse("NONE")).toBeNull();
  });

  it("keeps valid positions", () => {
    expect(optionalPlayingPositionSchema.parse("MED")).toBe("MED");
  });
});

describe("formatPlayingPositionCromoLine", () => {
  it("returns the Spanish abbreviation only when set", () => {
    expect(formatPlayingPositionCromoLine("POR")).toBe("POR");
    expect(formatPlayingPositionCromoLine("DEF")).toBe("DEF");
    expect(formatPlayingPositionCromoLine("MED")).toBe("MED");
    expect(formatPlayingPositionCromoLine("DEL")).toBe("DEL");
  });

  it("omits the line when empty (no Sin posición placeholder)", () => {
    expect(formatPlayingPositionCromoLine(null)).toBeNull();
    expect(formatPlayingPositionCromoLine(undefined)).toBeNull();
  });
});

describe("PLAYING_POSITION_STAFF_LABEL", () => {
  it("covers every enum with Spanish staff copy", () => {
    for (const value of PLAYING_POSITIONS) {
      expect(PLAYING_POSITION_STAFF_LABEL[value].length).toBeGreaterThan(0);
    }
  });
});
