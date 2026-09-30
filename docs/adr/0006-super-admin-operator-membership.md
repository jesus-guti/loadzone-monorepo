# Super Admin may attach an existing User without an invitation

A Coordinator still adds staff only by **Staff Invitation** (one-time link, the person sets a password). A person who is not yet a **User** still joins only that way, including the first Coordinator of a new Club. When the email already belongs to a User, a **Super Admin** may create the **Membership** immediately (**Operator Membership**): as that Club’s first Coordinator, as an extra Club, or as the destination of a **Membership Transfer**. The same operator may delete a User who is not a Super Admin, cascading Memberships, and may not leave a Club that already has a Coordinator with zero Coordinators. No temporary passwords, no public signup, no session impersonation.

## Considered options

- **Invitation for every join, including existing Users** — rejected for the operator console; support needs transfer and “add this Club” to take effect before the person clicks a link. Coordinators keep the accept step.
- **Temporary password set by the operator** — rejected; new people still choose a password on the invite link.
- **Delete Super Admins from the console** — rejected; the two operators must not be able to remove the platform flag by deleting the User.
