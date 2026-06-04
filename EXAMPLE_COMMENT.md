# Example Comment with AI Explanation

This is what Bob will post to your GitHub issues with the new AI-powered patch explanation:

---

🚧 **Commit Update** - In Progress

**Description:** Add JWT token validation middleware

**Commit:** [`a1b2c3d`](https://github.com/user/repo/commit/a1b2c3d)
**Author:** @sanjam
**Date:** Jun 4, 2026, 9:47 PM

## 📝 What This Patch Does

**Type:** New feature/functionality added
**Scope:** Modified 3 files (js, test files)
**Size:** Medium change (+134/-12 lines)

## 🔍 Detailed Changes

### `src/middleware/auth.js`

**Added:** New functions/methods implemented

**Key changes:**
- Implemented 2 new functions
- Added error handling
- Introduced asynchronous operations

### `tests/auth.test.js`

**Added:** New test cases added

**Key changes:**
- Added 5 test cases
- Added inline documentation

### `README.md`

**Modified:** Updated documentation

**Key changes:**
- Added inline documentation

## 💡 Impact Assessment

**Risk Level:** Medium
**Testing:** ✅ Tests included in this patch
**Review:** Standard review process

## 📂 Files Changed

- 📝 `src/middleware/auth.js` (+89/-8)
- ➕ `tests/auth.test.js` (+45/-0)
- 📝 `README.md` (+5/-4)

<details>
<summary>📋 View Raw Diff</summary>

```diff
diff --git a/src/middleware/auth.js b/src/middleware/auth.js
index abc123..def456 100644
--- a/src/middleware/auth.js
+++ b/src/middleware/auth.js
@@ -1,5 +1,15 @@
+const jwt = require('jsonwebtoken');
+
+async function validateToken(token) {
+  try {
+    const decoded = jwt.verify(token, process.env.JWT_SECRET);
+    return { valid: true, user: decoded };
+  } catch (error) {
+    return { valid: false, error: error.message };
+  }
+}
+
 module.exports = {
-  // TODO: Add authentication
+  validateToken
 };
```

</details>

---
*🤖 Automated by Bob Sprint Assistant*

---

## Key Features of the AI Explanation

1. **High-Level Summary**: Tells you what type of change it is (feature, refactor, cleanup)
2. **Scope & Size**: Quick overview of how many files and lines changed
3. **Per-File Analysis**: Explains what happened in each file
4. **Key Changes**: Bullet points of important additions (new functions, tests, error handling, etc.)
5. **Impact Assessment**: Risk level, testing status, and review recommendations
6. **Collapsible Raw Diff**: Full diff hidden in a dropdown to keep the comment clean

## How It Works

Bob analyzes:
- File types and extensions
- Code patterns (functions, classes, imports, tests)
- Change types (additions, deletions, modifications)
- Testing coverage
- Documentation updates
- Error handling additions
- Async operations
- Type definitions

Then generates a human-readable explanation that helps reviewers understand the patch at a glance!