# Framer Setup & Publishing Guide for Skillpath

This guide explains how to copy the `SkillpathCourses` code component into Framer, design the complete landing page, and publish it.

---

## 1. Step-by-Step Framer Setup

### Step 1: Create a Free Framer Project
1. Go to [framer.com](https://framer.com) and log in.
2. Click **New Project** → choose a **Blank Canvas**.

### Step 2: Create the Code Component
1. In the left sidebar, click the **Assets** tab (or press `Cmd / Ctrl + 1`).
2. Click **Code** → **Create Code Component**.
3. Name the file: `SkillpathCourses.tsx`.
4. Replace all default code with the contents of [`framer/SkillpathCourses.framer.tsx`](./framer/SkillpathCourses.framer.tsx).
5. Save the file (`Cmd + S` / `Ctrl + S`).

### Step 3: Add Component to Canvas
1. Return to the canvas page.
2. Drag `SkillpathCourses` from the **Assets > Code** sidebar directly onto your canvas.
3. Set the width to `100%` / `Fill`.

### Step 4: Configure Property Controls in Framer Panel
Select the component on canvas. In the right property inspector, you will see the property controls:
- **Title**: Customize the section heading (e.g., *"Featured Courses"*).
- **Subtitle**: Customize the subtitle.
- **Currency**: Switch between `Auto (API / Fallback)`, `India (INR ₹)`, or `United States (USD $)`.
- **Accent Color**: Pick any brand hex color (e.g. `#6366f1` or custom).
- **Show Search**: Toggle the search bar on or off.

---

## 2. Assembling the Full Landing Page

The page requires three sections:
1. **Hero Section**:
   - Headline: *"Master High-Impact Skills with Creator-Led Systems"*
   - Subhead: *"Actionable, system-driven playbooks for creators, freelancers, and ambitious builders."*
   - Button: *"Explore Courses"* (Set link to scroll to courses section).
2. **Courses Section**:
   - Add your `SkillpathCourses` code component.
3. **Footer Section**:
   - Add 3 links: *Courses*, *Terms of Service*, *Privacy Policy*
   - Add copyright line: *© 2026 Skillpath, Inc. All rights reserved.*

---

## 3. Publishing the Page
1. In the top-right corner of Framer, click **Publish**.
2. Copy the generated `.framer.app` / `.framer.website` live URL.
3. Test your live link in an incognito window to verify that:
   - Live courses load from the API.
   - Prices format as `₹1,999` (paise / 100) or `$39.99` (cents / 100).
   - Retrying handles 404/500 flakiness smoothly.
