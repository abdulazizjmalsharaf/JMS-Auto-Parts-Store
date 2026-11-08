---
name: Supabase accounts for JMS
description: The user's explicit choice of Supabase and integration into the existing JMS storefront.
---

Use Supabase email/password accounts in the existing JMS storefront, using the user's existing Supabase project and saved keys, rather than delivering the uploaded HTML as a standalone store.

**Why:** The user repeatedly clarified that the functionality in their uploaded example must be applied to JMS with the keys they already provided.

**How to apply:** Preserve this provider choice when extending account features; do not replace it with a default authentication provider without a new user request.
