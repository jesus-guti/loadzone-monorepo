# wayfinder:grilling

## Question

After the dry-run (#06), review which custom components to keep, regenerate, or rewrite.

For each custom component identified in #03 (custom components audit):
1. If it's now a standard shadcn component → regenerate it
2. If it remains custom → decide whether to:
   - Keep as-is (if it doesn't use radix APIs)
   - Rewrite to use Base UI primitives
   - Drop it if unused
3. For the app-specific custom components (`hover-border-gradient`, `moving-border`, `noise-background`) — these are presentational, decide whether to keep or replace with shadcn alternatives
