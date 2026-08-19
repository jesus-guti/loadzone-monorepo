# Team Wellness CSV uses the Excel (es) dialect

Staff export **DailyEntry** history to open in Excel, not to feed scripts. v1 files are UTF-8 **with BOM**, field separator **`;`**, and RFC-style quoting. Clubs will build spreadsheets against that shape; switching later to comma/RFC-without-BOM would break double-click open in Spanish Excel and existing templates.

**Considered options:** RFC 4180 (comma, no BOM) — better for tools, worse for the actual user; two dialects in v1 — extra chrome for no second consumer.

**Consequences:** Tests must assert BOM + `;`, not a generic `join(",")`. Do not add a second download format until a real non-Excel consumer exists.
