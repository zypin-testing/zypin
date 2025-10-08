# Playwright Regression Testing - Suite Configuration Guide

**A complete guide to configure and run regression tests with actions, collectors, comparators, and filters.**

---

## 🚀 3-Minute Quick Start

### 1. Run Your First Test
```bash
npm test
```

### 2. Update Baselines (after first run)
```bash
npx playwright test --update-snapshots
```

### 3. Test with Custom URL
```bash
BASE_URL=https://your-site.com npm test
```

---

## 📋 Suite JSON Structure

Every test suite follows this pattern:

```json
{
  "name": "Test Name",
  "urls": ["/page1", "/page2"],
  "viewports": [
    {"name": "Desktop", "width": 1920, "height": 1080},
    {"name": "Mobile", "width": 414, "height": 896}
  ],
  "actions": [/* optional: things to do before testing */],
  "collect": [/* what to test and how to compare */]
}
```

**💡 Tip:** The framework runs **every URL** × **every viewport** = efficient testing!

---

## 🎯 5 Essential Patterns

### Pattern 1: Basic Screenshot Test
```json
{
  "name": "Visual Test",
  "urls": ["https://playwright.dev"],
  "viewports": [{"name": "Desktop", "width": 1920, "height": 1080}],
  "actions": [],
  "collect": [
    {
      "type": "screen",
      "comparator": "layout"
    }
  ]
}
```
**Use when:** Simple visual regression testing

---

### Pattern 2: Interactive Test (Click → Wait → Capture)
```json
{
  "name": "Menu Click Test",
  "urls": ["https://example.com"],
  "viewports": [{"name": "Desktop", "width": 1920, "height": 1080}],
  "actions": [
    {"type": "click", "selector": "#menu-button"},
    {"type": "sleep", "duration": 500}
  ],
  "collect": [
    {"type": "screen", "comparator": "layout"}
  ]
}
```
**Use when:** Testing dropdowns, modals, interactive elements

---

### Pattern 3: Hide Dynamic Content
```json
{
  "name": "Hide Timestamps",
  "urls": ["https://example.com"],
  "viewports": [{"name": "Desktop", "width": 1920, "height": 1080}],
  "actions": [
    {"type": "hide", "selector": ".timestamp"},
    {"type": "hide", "selector": ".live-price"}
  ],
  "collect": [
    {"type": "screen", "comparator": "layout"}
  ]
}
```
**Use when:** Pages have timestamps, live data, or ads that change constantly

---

### Pattern 4: Multi-Collector (Comprehensive Testing)
```json
{
  "name": "Full Page Test",
  "urls": ["https://example.com"],
  "viewports": [{"name": "Desktop", "width": 1920, "height": 1080}],
  "actions": [],
  "collect": [
    {"type": "screen", "comparator": "layout"},
    {"type": "jsErrors", "comparator": "jsErrors", "options": {"maxErrors": 0}},
    {"type": "statusCodes", "comparator": "statusCodes"}
  ]
}
```
**Use when:** You want visual + JS errors + HTTP status validation in one test

---

### Pattern 5: Filters for Dynamic HTML
```json
{
  "name": "HTML with Dynamic Data",
  "urls": ["https://example.com"],
  "viewports": [{"name": "Desktop", "width": 1920, "height": 1080}],
  "actions": [],
  "collect": [
    {
      "type": "source",
      "comparator": "source",
      "filters": [
        {
          "type": "regex",
          "pattern": "\\d{4}-\\d{2}-\\d{2}",
          "replacement": "{{DATE}}"
        }
      ]
    }
  ]
}
```
**Use when:** HTML source changes (dates, IDs, nonces) but structure should stay the same

---

## 📚 Quick Reference

### Actions (What to Do Before Testing)

| Action | Usage | Example |
|--------|-------|---------|
| `click` | Click element | `{"type": "click", "selector": "#btn"}` |
| `hide` | Hide element | `{"type": "hide", "selector": ".ad"}` |
| `sleep` | Wait X ms | `{"type": "sleep", "duration": 1000}` |
| `scroll` | Scroll page | `{"type": "scroll", "y": 500}` |
| `hover` | Hover element | `{"type": "hover", "selector": ".menu"}` |
| `type` | Fill input | `{"type": "type", "selector": "input", "text": "hello"}` |
| `waitForElement` | Wait for visible | `{"type": "waitForElement", "selector": ".content"}` |
| `loadCookies` | Auth cookies | `{"type": "loadCookies", "cookies": [...]}` |

**🔗 Full list:** See `examples/all-actions.json`

---

### Collectors (What to Test)

| Collector | Tests | Comparator |
|-----------|-------|------------|
| `screen` | Visual screenshots | `layout` |
| `source` | HTML source code | `source` |
| `jsErrors` | Console errors | `jsErrors` |
| `statusCodes` | HTTP codes | `statusCodes` |
| `cookies` | Browser cookies | `cookies` |
| `performance` | Page speed | _(no comparator, just collects)_ |

---

### Filters (Clean Data Before Comparison)

| Filter | Purpose | Example |
|--------|---------|---------|
| `regex` | Replace patterns | Replace dates: `"pattern": "\\d{4}-\\d{2}-\\d{2}"` |
| `remove` | Remove lines | Remove comments: `"patterns": ["<!--.*?-->"]` |
| `removeNodes` | Remove HTML elements | Remove scripts: `"selectors": ["script"]` |

**💡 Pro Tip:** Chain filters! `[removeNodes, regex, remove]` applies them in order.

---

## 🎓 Common Options

### Layout Comparator Options
```json
{
  "type": "screen",
  "comparator": "layout",
  "options": {
    "fullPage": true,              // Full page screenshot (default: true)
    "maxDiffPixelRatio": 0.01      // 1% pixel difference allowed
  }
}
```

### JS Errors Comparator Options
```json
{
  "type": "jsErrors",
  "comparator": "jsErrors",
  "options": {
    "maxErrors": 0,                     // Fail if any errors
    "allowedPatterns": ["analytics.*"]  // Ignore analytics errors
  }
}
```

### Status Codes Comparator Options
```json
{
  "type": "statusCodes",
  "comparator": "statusCodes",
  "options": {
    "allowedCodes": [200, 301, 302, 304],
    "ignorePatterns": ["google-analytics\\.com"]
  }
}
```

---

## 📂 Example Suites

Explore `examples/` folder for ready-to-use templates:

- **`basic.json`** - Simplest possible test
- **`interactive.json`** - Click, hover, type demos
- **`multi-viewport.json`** - Responsive design testing
- **`all-actions.json`** - Every action demonstrated
- **`multi-collector.json`** - Multiple collectors in one test
- **`filters.json`** - Data filtering examples

**💡 Copy & modify** these examples for your own tests!

---

## 🔧 Pro Tips

### 1. Responsive Testing (Automatic)
```json
"viewports": [
  {"name": "Desktop", "width": 1920, "height": 1080},
  {"name": "Tablet", "width": 768, "height": 1024},
  {"name": "Mobile", "width": 414, "height": 896}
]
```
**Result:** 3 screenshots per URL automatically!

### 2. Authentication with Cookies
```json
"actions": [
  {
    "type": "loadCookies",
    "cookies": [
      {
        "name": "auth_token",
        "value": "your-token",
        "domain": ".example.com",
        "path": "/",
        "secure": true
      }
    ]
  }
]
```

### 3. Wait for Content to Load
```json
"actions": [
  {"type": "waitForPageLoaded", "state": "networkidle"},
  {"type": "waitForImages", "timeout": 10000}
]
```

### 4. Hide Multiple Dynamic Elements
```json
"actions": [
  {"type": "hide", "selector": ".timestamp"},
  {"type": "hide", "selector": ".live-data"},
  {"type": "hide", "selector": "[data-dynamic='true']"}
]
```

---

## 🚨 Common Mistakes to Avoid

❌ **Don't:** Forget to hide timestamps/dates  
✅ **Do:** Use `hide` action or `regex` filter

❌ **Don't:** Use pixel-perfect comparison (maxDiffPixelRatio: 0)  
✅ **Do:** Allow small differences (maxDiffPixelRatio: 0.01)

❌ **Don't:** Test pages with constantly changing ads  
✅ **Do:** Use `ignorePatterns` for ad domains in statusCodes

❌ **Don't:** Mix too many actions in one test  
✅ **Do:** Create separate test suites for different scenarios

---

## 📖 Learn More

- **Main README:** `../README.md` (project documentation)
- **Playwright Docs:** https://playwright.dev
- **zypin Docs:** https://github.com/zypin-testing/zypin

---

**Ready to test?** Edit `suite.json` or create your own in `examples/` folder! 🎉

