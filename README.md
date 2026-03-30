# Label Studio 🏷️

![Label Studio](https://labelstud.io/images/label-studio-logo.svg)

## Professional Document & Invoice Labeling Tool

Label Studio is an advanced, high-performance annotation platform designed for YOLO dataset creation. Specifically optimized for complex documents like **invoices**, **receipts**, and **forms**, it provides a seamless, filesystem-first experience for AI researchers and developers.

---

## 🚀 Key Features

- **Direct Filesystem Workflow**: No database required. Load and save directly to your local dataset folders.
- **Invoice Optimized**: Handles high-resolution documents with ease.
- **Smart Interactions**:
  - **Scroll-to-Zoom & Panning**: Navigate complex documents like a pro.
  - **Edge-Anchored Resizing**: Precise bounding box adjustments.
  - **Copy/Paste (Ctrl+C/V)**: Rapidly replicate similar fields.
- **YOLO Format Native**: Automatically reads and writes standard `.txt` label files and `notes.json` categories.
- **Premium UI**: Modern dark-mode interface with compact labeling for dense documents.

---

## 🛠️ Getting Started

### 1. Installation
Ensure you have [Node.js](https://nodejs.org/) and `pnpm` installed.

```bash
pnpm install
```

### 2. Run Locally

```bash
pnpm dev
```
The application will be available at `http://localhost:3000`.

---

## 📖 How to Use

### Step 1: Prepare your Dataset
Your dataset folder should have the following structure:
```text
my-dataset/
├── image/       (Contains .png, .jpg, .jpeg images)
├── label/       (Empty or contains existing YOLO .txt files)
└── notes.json   (Your category definitions)
```

**notes.json format:**
```json
{
  "categories": [
    {"id": 0, "name": "Logo"},
    {"id": 1, "name": "Table"},
    {"id": 2, "name": "Text"}
  ]
}
```

### Step 2: Load the Directory
1. Open the app and click **Open Files**.
2. Paste the **absolute path** to your `my-dataset` folder.
3. Click **Load**.

### Step 3: Start Labeling
- **Select a Category**: Click on a category in the sidebar (Logo, Text, etc.).
- **Draw**: Left-click and drag on the document to create a box.
- **Adjust**: Click a box to select it. Drag it to move, or use the corner handles to resize.
- **Navigate**: 
  - **Mouse Wheel**: Zoom in/out.
  - **Right Click + Drag**: Pan the document.
  - **Left Click on Background**: Panning (when in select mode).

### Step 4: Save Progress
Click the **Save** button in the header. The app will write `.txt` files directly into your `/label` folder.

---

## ✨ Best Practices for Invoices

1. **Precision Matters**: Zoom in deep before adjusting edges for fields like "Total Amount" or "Tax ID".
2. **Standardization**: Use the same category IDs across all images for consistent training.
3. **Speed up with Copy/Paste**: For tables with many similar rows, draw one box, then `Ctrl+C` and `Ctrl+V` to quickly create the others.
4. **Independent Edges**: Always use the corner handles to lock the opposite side in place for exact alignment.

---

## 🏗️ Architecture
Built with **Next.js**, **Tailwind CSS**, and **Zustand** for state management. No external database or cloud dependency is required, ensuring absolute data privacy.
