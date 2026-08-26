# Decide pointer and gyro interaction contract

Type: grilling  
Status: resolved  
Blocked by: 02

## Question

When is pointer/touch tracking and device orientation allowed on the Streak Cromo (compact header vs racha sheet), how do we handle iOS permission and `prefers-reduced-motion`, and how does this replace the glossary line “ambient CSS only — no pointer tracking”?

## Answer

Tracking on **full cromo only**: Racha sheet + today’s completion — not the header pill. Pointer/touch is the default; modest 3D + glare. Ambient loop until interact, then yield, then ease back. Gyro is opt-in via a Racha-sheet control (iOS permission); celebration uses gyro only if already granted. `prefers-reduced-motion`: static paint, no loop/pointer/gyro. Glossary no longer says “ambient CSS only — no pointer tracking”.
