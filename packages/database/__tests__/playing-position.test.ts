import { describe, expect, it } from "vitest";

import {
  formatPlayingPositionCromoLine,
  optionalPlayingPositionSchema,
  PLAYING_POSITIONS,
  PLAYING_POSITION_STAFF_LABEL,
  playingPositionSchema,
} from "../playing-position";

describe("playingPositionSchema", () => {
  it("accepts the specific roles", () => {
    expect(PLAYING_POSITIONS).toEqual([
      "POR",
      "DFC",
      "LD",
      "LI",
      "MCD",
      "MC",
      "MCO",
      "ED",
      "EI",
      "DC",
    ]);
    for (const value of PLAYING_POSITIONS) {
      expect(playingPositionSchema.parse(value)).toBe(value);
    }
  });

  it("rejects retired coarse lines and unknown values", () => {
    expect(playingPositionSchema.safeParse("DEF").success).toBe(false);
    expect(playingPositionSchema.safeParse("MED").success).toBe(false);
    expect(playingPositionSchema.safeParse("DEL").success).toBe(false);
    expect(playingPositionSchema.safeParse("GK").success).toBe(false);
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
    expect(optionalPlayingPositionSchema.parse("MC")).toBe("MC");
  });
});

describe("formatPlayingPositionCromoLine", () => {
  it("returns the Spanish abbreviation only when set", () => {
    expect(formatPlayingPositionCromoLine("POR")).toBe("POR");
    expect(formatPlayingPositionCromoLine("DFC")).toBe("DFC");
    expect(formatPlayingPositionCromoLine("MCO")).toBe("MCO");
    expect(formatPlayingPositionCromoLine("DC")).toBe("DC");
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
