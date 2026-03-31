<p align="center">
  <img width="1919" height="862" alt="image" src="https://github.com/user-attachments/assets/d0024f24-e03a-402b-abfa-86043eb48c22" />
</p>



<p align="center">
  <strong>LABEL: The high-performance AI document labeling app you were looking for.</strong><br>
  Optimized for invoices, receipts, and complex forms. Hyper-configurable, filesystem-first, & no frustrating setup required.
</p>



<p align="center">
  English 
</p>

<p align="center">
  👉 <strong>LABEL for desktop (Mac, Windows, & Linux)!</strong> 
</p>

---


## 🚀 Key Features

- **Direct Filesystem Workflow**: No database required. Load and save directly to your local dataset folders.
- **Real-Time Auto-Save**: Automatically synchronizes your label modifications to disk with a 1-second debounce (can be toggled in the header).
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
By default, **Auto Save** is enabled. Your modifications will be written to `.txt` files in the `/label` folder automatically 1 second after you stop editing.

- **Manual Save**: Click the **Save** button or press `Ctrl + S` at any time for manual confirmation.
- **Toggle Auto-Save**: You can enable or disable this feature using the **Auto Save** switch in the header.

---

## ✨ Best Practices for Invoices

1. **Precision Matters**: Zoom in deep before adjusting edges for fields like "Total Amount" or "Tax ID".
2. **Standardization**: Use the same category IDs across all images for consistent training.
3. **Speed up with Copy/Paste**: For tables with many similar rows, draw one box, then `Ctrl+C` and `Ctrl+V` to quickly create the others.
4. **Independent Edges**: Always use the corner handles to lock the opposite side in place for exact alignment.

---

## 🏗️ Architecture
Built with **Next.js**, **Tailwind CSS**, and **Zustand** for state management. No external database or cloud dependency is required, ensuring absolute data privacy.
