
/* =========================================================
   LAYERFORGE — ADVANCED VANILLA JS EDITOR
   Fabric.js powered canvas
========================================================= */

const canvas = new fabric.Canvas("designCanvas", {
  preserveObjectStacking: true,
  selection: true
});

const emptyHint = document.getElementById("emptyHint");
const layersList = document.getElementById("layersList");
const toast = document.getElementById("toast");

let zoom = 1;
let history = [];
let historyIndex = -1;
let isRestoring = false;

/* =========================================================
   HELPERS
========================================================= */

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function updateEmptyState() {
  emptyHint.style.display =
    canvas.getObjects().length === 0 ? "block" : "none";
}

function getSelected() {
  return canvas.getActiveObject();
}

function saveHistory() {
  if (isRestoring) return;

  const json = JSON.stringify(canvas.toJSON());

  if (historyIndex < history.length - 1) {
    history = history.slice(0, historyIndex + 1);
  }

  history.push(json);

  if (history.length > 50) {
    history.shift();
  } else {
    historyIndex++;
  }
}

function restoreHistory(index) {
  if (index < 0 || index >= history.length) return;

  isRestoring = true;

  canvas.loadFromJSON(history[index], () => {
    canvas.renderAll();
    updateLayers();
    updateProperties();
    updateEmptyState();
    isRestoring = false;
  });
}

/* =========================================================
   HISTORY
========================================================= */

document.getElementById("undoBtn").onclick = () => {
  if (historyIndex <= 0) {
    showToast("Nothing to undo");
    return;
  }

  historyIndex--;
  restoreHistory(historyIndex);
};

document.getElementById("redoBtn").onclick = () => {
  if (historyIndex >= history.length - 1) {
    showToast("Nothing to redo");
    return;
  }

  historyIndex++;
  restoreHistory(historyIndex);
};

/* =========================================================
   PANELS
========================================================= */

document.querySelectorAll(".tool").forEach(tool => {
  tool.addEventListener("click", () => {

    document.querySelectorAll(".tool")
      .forEach(x => x.classList.remove("active"));

    tool.classList.add("active");

    document.querySelectorAll(".panel-content")
      .forEach(panel => panel.classList.remove("active"));

    const panelName = tool.dataset.panel + "Panel";
    document.getElementById(panelName).classList.add("active");
  });
});

/* =========================================================
   ADD TEXT
========================================================= */

function addText(text, size, weight = "normal") {

  const obj = new fabric.IText(text, {
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 2,
    originX: "center",
    originY: "center",
    fill: "#ffffff",
    fontFamily: "Inter",
    fontSize: size,
    fontWeight: weight,
    editable: true,
    padding: 5,
    cornerColor: "#7c5cff",
    cornerStyle: "circle",
    transparentCorners: false
  });

  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.renderAll();

  saveHistory();
  updateLayers();
  updateProperties();
  updateEmptyState();
}

document.getElementById("addHeading").onclick =
  () => addText("Your Heading", 54, "bold");

document.getElementById("addSubheading").onclick =
  () => addText("Your Subheading", 34, "600");

document.getElementById("addBody").onclick =
  () => addText("Your text here", 22);

/* =========================================================
   UPLOAD IMAGE
========================================================= */

const imageUpload = document.getElementById("imageUpload");

imageUpload.addEventListener("change", event => {

  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {

    fabric.Image.fromURL(e.target.result, img => {

      const maxWidth = canvas.getWidth() * 0.85;
      const maxHeight = canvas.getHeight() * 0.85;

      const scale = Math.min(
        maxWidth / img.width,
        maxHeight / img.height,
        1
      );

      img.set({
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
        cornerColor: "#7c5cff",
        cornerStyle: "circle",
        transparentCorners: false
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();

      document.getElementById("uploadPreview").innerHTML =
        `<img src="${e.target.result}" alt="Uploaded image">`;

      saveHistory();
      updateLayers();
      updateProperties();
      updateEmptyState();

      showToast("Image added");
    });
  };

  reader.readAsDataURL(file);
});

/* Start upload button */

document.getElementById("startUploadBtn").onclick = () => {
  document.querySelector('[data-panel="uploads"]').click();
  imageUpload.click();
};

/* =========================================================
   SHAPES
========================================================= */

document.getElementById("addRect").onclick = () => {

  const rect = new fabric.Rect({
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 2,
    originX: "center",
    originY: "center",
    width: 220,
    height: 130,
    rx: 12,
    ry: 12,
    fill: "#7c5cff",
    cornerColor: "#ffffff",
    transparentCorners: false
  });

  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.renderAll();

  saveHistory();
  updateLayers();
  updateProperties();
};

document.getElementById("addCircle").onclick = () => {

  const circle = new fabric.Circle({
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 2,
    originX: "center",
    originY: "center",
    radius: 80,
    fill: "#22c55e",
    cornerColor: "#ffffff",
    transparentCorners: false
  });

  canvas.add(circle);
  canvas.setActiveObject(circle);
  canvas.renderAll();

  saveHistory();
  updateLayers();
  updateProperties();
};

/* =========================================================
   TEXT PROPERTIES
========================================================= */

const textValue = document.getElementById("textValue");
const fontFamily = document.getElementById("fontFamily");
const fontSize = document.getElementById("fontSize");
const textColor = document.getElementById("textColor");

textValue.addEventListener("input", () => {

  const obj = getSelected();

  if (!obj || !obj.text) return;

  obj.set("text", textValue.value);

  canvas.renderAll();
  saveHistory();
  updateLayers();
});

fontFamily.addEventListener("change", () => {

  const obj = getSelected();

  if (!obj || !obj.text) return;

  obj.set("fontFamily", fontFamily.value);

  canvas.renderAll();
  saveHistory();
});

fontSize.addEventListener("input", () => {

  const obj = getSelected();

  if (!obj || !obj.text) return;

  obj.set("fontSize", Number(fontSize.value));

  canvas.renderAll();
  saveHistory();
});

textColor.addEventListener("input", () => {

  const obj = getSelected();

  if (!obj) return;

  obj.set("fill", textColor.value);

  canvas.renderAll();
  saveHistory();
});

/* Formatting */

document.getElementById("boldBtn").onclick = () => {

  const obj = getSelected();

  if (!obj || !obj.text) return;

  obj.set(
    "fontWeight",
    obj.fontWeight === "bold" ? "normal" : "bold"
  );

  canvas.renderAll();
  saveHistory();
  updateProperties();
};

document.getElementById("italicBtn").onclick = () => {

  const obj = getSelected();

  if (!obj || !obj.text) return;

  obj.set(
    "fontStyle",
    obj.fontStyle === "italic" ? "normal" : "italic"
  );

  canvas.renderAll();
  saveHistory();
};

document.getElementById("underlineBtn").onclick = () => {

  const obj = getSelected();

  if (!obj || !obj.text) return;

  obj.set("underline", !obj.underline);

  canvas.renderAll();
  saveHistory();
};

/* =========================================================
   OBJECT PROPERTIES
========================================================= */

document.getElementById("opacityRange").oninput = e => {

  const obj = getSelected();

  if (!obj) return;

  obj.set("opacity", Number(e.target.value));

  canvas.renderAll();
};

document.getElementById("rotationRange").oninput = e => {

  const obj = getSelected();

  if (!obj) return;

  obj.set("angle", Number(e.target.value));

  canvas.renderAll();
};

document.getElementById("objectWidth").onchange = e => {

  const obj = getSelected();

  if (!obj) return;

  obj.scaleToWidth(Number(e.target.value));

  canvas.renderAll();
  saveHistory();
};

document.getElementById("objectHeight").onchange = e => {

  const obj = getSelected();

  if (!obj) return;

  obj.scaleToHeight(Number(e.target.value));

  canvas.renderAll();
  saveHistory();
};

/* =========================================================
   BACKGROUND
========================================================= */

document.getElementById("bgColor").addEventListener("input", e => {

  canvas.backgroundColor = e.target.value;
  canvas.renderAll();

  saveHistory();
});

document.getElementById("clearBg").onclick = () => {

  canvas.backgroundColor = "transparent";
  canvas.renderAll();

  saveHistory();
  showToast("Background removed");
};

/* =========================================================
   DELETE
========================================================= */

document.getElementById("deleteBtn").onclick = deleteSelected;

function deleteSelected() {

  const obj = getSelected();

  if (!obj) {
    showToast("Select something first");
    return;
  }

  canvas.remove(obj);
  canvas.discardActiveObject();
  canvas.renderAll();

  saveHistory();
  updateLayers();
  updateProperties();
  updateEmptyState();

  showToast("Element deleted");
}

document.addEventListener("keydown", e => {

  if (
    e.key === "Delete" ||
    e.key === "Backspace"
  ) {

    const active = getSelected();

    if (active && !active.isEditing) {
      deleteSelected();
    }
  }

  if ((e.ctrlKey || e.metaKey) && e.key === "z") {
    e.preventDefault();
    document.getElementById("undoBtn").click();
  }

  if (
    (e.ctrlKey || e.metaKey) &&
    (e.key === "y" || (e.shiftKey && e.key === "z"))
  ) {
    e.preventDefault();
    document.getElementById("redoBtn").click();
  }
});

/* =========================================================
   PROPERTIES PANEL
========================================================= */

function updateProperties() {

  const obj = getSelected();

  const noSelection = document.getElementById("noSelection");
  const textProperties = document.getElementById("textProperties");
  const objectProperties = document.getElementById("objectProperties");

  if (!obj) {

    noSelection.classList.remove("hidden");
    textProperties.classList.add("hidden");
    objectProperties.classList.add("hidden");

    return;
  }

  noSelection.classList.add("hidden");
  objectProperties.classList.remove("hidden");

  document.getElementById("opacityRange").value =
    obj.opacity ?? 1;

  document.getElementById("rotationRange").value =
    obj.angle || 0;

  document.getElementById("objectWidth").value =
    Math.round(obj.getScaledWidth());

  document.getElementById("objectHeight").value =
    Math.round(obj.getScaledHeight());

  if (obj.text !== undefined) {

    textProperties.classList.remove("hidden");

    textValue.value = obj.text;
    fontFamily.value = obj.fontFamily || "Inter";
    fontSize.value = obj.fontSize || 40;

    const fill = typeof obj.fill === "string"
      ? obj.fill
      : "#ffffff";

    if (/^#[0-9a-f]{6}$/i.test(fill)) {
      textColor.value = fill;
    }
  } else {
    textProperties.classList.add("hidden");
  }
}

/* =========================================================
   LAYERS
========================================================= */

function updateLayers() {

  layersList.innerHTML = "";

  const objects = canvas.getObjects();

  [...objects].reverse().forEach((obj, index) => {

    const item = document.createElement("div");

    item.className = "layer-item";

    if (obj === getSelected()) {
      item.classList.add("selected");
    }

    let name = "Element";

    if (obj.type === "i-text") {
      name = obj.text?.substring(0, 20) || "Text";
    } else if (obj.type === "image") {
      name = "Image";
    } else if (obj.type === "rect") {
      name = "Rectangle";
    } else if (obj.type === "circle") {
      name = "Circle";
    }

    item.innerHTML = `
      <span>${name}</span>
      <span>↕</span>
    `;

    item.onclick = () => {

      canvas.setActiveObject(obj);
      canvas.renderAll();

      updateLayers();
      updateProperties();
    };

    layersList.appendChild(item);
  });
}

/* =========================================================
   CANVAS EVENTS
========================================================= */

canvas.on("selection:created", () => {
  updateLayers();
  updateProperties();
});

canvas.on("selection:updated", () => {
  updateLayers();
  updateProperties();
});

canvas.on("selection:cleared", () => {
  updateLayers();
  updateProperties();
});

canvas.on("object:modified", () => {
  saveHistory();
  updateLayers();
  updateProperties();
});

canvas.on("object:added", () => {
  updateEmptyState();
});

canvas.on("object:removed", () => {
  updateEmptyState();
});

/* =========================================================
   ZOOM
========================================================= */

function updateZoom() {

  canvas.setZoom(zoom);

  document.getElementById("zoomValue").textContent =
    `${Math.round(zoom * 100)}%`;

  const wrapper = document.getElementById("canvasWrapper");

  wrapper.style.width =
    `${canvas.getWidth() * zoom}px`;

  wrapper.style.height =
    `${canvas.getHeight() * zoom}px`;
}

document.getElementById("zoomIn").onclick = () => {

  zoom = Math.min(zoom + 0.1, 2);
  updateZoom();
};

document.getElementById("zoomOut").onclick = () => {

  zoom = Math.max(zoom - 0.1, 0.3);
  updateZoom();
};

/* =========================================================
   RESIZE CANVAS
========================================================= */

document.getElementById("resizeCanvas").onclick = () => {

  const width =
    Number(document.getElementById("canvasWidth").value);

  const height =
    Number(document.getElementById("canvasHeight").value);

  if (width < 100 || height < 100) {
    showToast("Minimum canvas size is 100×100");
    return;
  }

  canvas.setWidth(width);
  canvas.setHeight(height);

  canvas.renderAll();

  updateZoom();
  saveHistory();

  showToast("Canvas resized");
};

/* =========================================================
   EXPORT
========================================================= */

document.getElementById("exportBtn").onclick = () => {

  const dataURL = canvas.toDataURL({
    format: "png",
    multiplier: 2
  });

  const link = document.createElement("a");

  link.download =
    `${document.getElementById("designName").value || "design"}.png`;

  link.href = dataURL;
  link.click();

  showToast("Design exported");
};

/* =========================================================
   LOCAL SAVE
========================================================= */

document.getElementById("saveBtn").onclick = () => {

  const design = {
    name: document.getElementById("designName").value,
    canvas: canvas.toJSON(),
    background: canvas.backgroundColor,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(
    "layerforge-design",
    JSON.stringify(design)
  );

  showToast("Design saved locally");
};

function loadSavedDesign() {

  const saved =
    localStorage.getItem("layerforge-design");

  if (!saved) return;

  try {

    const design = JSON.parse(saved);

    document.getElementById("designName").value =
      design.name || "Untitled Design";

    canvas.loadFromJSON(design.canvas, () => {

      canvas.backgroundColor =
        design.background || "#111827";

      canvas.renderAll();

      updateLayers();
      updateProperties();
      updateEmptyState();

      saveHistory();
    });

  } catch {
    console.warn("Could not load saved design");
  }
}

/* =========================================================
   NEW DESIGN
========================================================= */

document.getElementById("newDesignBtn").onclick = () => {

  if (!confirm("Start a new design? Current unsaved changes will be removed.")) {
    return;
  }

  canvas.clear();
  canvas.backgroundColor = "#111827";

  document.getElementById("designName").value =
    "Untitled Design";

  canvas.renderAll();

  history = [];
  historyIndex = -1;

  saveHistory();
  updateLayers();
  updateProperties();
  updateEmptyState();

  showToast("New design created");
};

/* =========================================================
   TEMPLATES
========================================================= */

document.querySelectorAll(".template-card")
  .forEach(card => {

    card.addEventListener("click", () => {

      const template = card.dataset.template;

      canvas.clear();

      canvas.backgroundColor = "#111827";

      if (template === "sale") {

        canvas.backgroundColor = "#fa3f58";

        addText("BIG SALE", 52, "bold");

        const discount = addText;

        const obj = new fabric.IText("50% OFF", {
          left: 450,
          top: 290,
          originX: "center",
          originY: "center",
          fill: "#ffffff",
          fontFamily: "Impact",
          fontSize: 86,
          fontWeight: "bold"
        });

        canvas.add(obj);

        const shop = new fabric.IText("SHOP NOW", {
          left: 450,
          top: 410,
          originX: "center",
          originY: "center",
          fill: "#111111",
          fontFamily: "Inter",
          fontSize: 25,
          fontWeight: "bold",
          backgroundColor: "#ffffff",
          padding: 12
        });

        canvas.add(shop);

      } else if (template === "event") {

        canvas.backgroundColor = "#1e1b4b";

        canvas.add(new fabric.IText("LIVE EVENT", {
          left: 450,
          top: 190,
          originX: "center",
          originY: "center",
          fill: "#ffffff",
          fontSize: 30,
          fontWeight: "bold"
        }));

        canvas.add(new fabric.IText("TONIGHT", {
          left: 450,
          top: 290,
          originX: "center",
          originY: "center",
          fill: "#a78bfa",
          fontSize: 80,
          fontWeight: "bold"
        }));

        canvas.add(new fabric.IText("7:00 PM", {
          left: 450,
          top: 400,
          originX: "center",
          originY: "center",
          fill: "#ffffff",
          fontSize: 30
        }));

      } else {

        canvas.backgroundColor = "#0f766e";

        canvas.add(new fabric.IText("YOUR", {
          left: 450,
          top: 210,
          originX: "center",
          originY: "center",
          fill: "#ffffff",
          fontSize: 45,
          fontWeight: "bold"
        }));

        canvas.add(new fabric.IText("STORY", {
          left: 450,
          top: 310,
          originX: "center",
          originY: "center",
          fill: "#ffffff",
          fontSize: 85,
          fontWeight: "bold"
        }));

      }

      canvas.renderAll();

      saveHistory();
      updateLayers();
      updateProperties();
      updateEmptyState();

      showToast("Template loaded");
    });
  });

/* =========================================================
   SHARE
========================================================= */

const shareModal = document.getElementById("shareModal");

document.getElementById("shareBtn").onclick = () => {

  /*
    V1:
    Generate a local share identifier.

    V2:
    Replace this with a backend database:
    Supabase / Firebase / custom API.
  */

  const encoded = btoa(
    unescape(
      encodeURIComponent(
        JSON.stringify(canvas.toJSON())
      )
    )
  );

  const base =
    window.location.origin +
    window.location.pathname;

  const link =
    `${base}?design=${encodeURIComponent(encoded)}`;

  document.getElementById("shareLink").value = link;

  shareModal.classList.add("active");
};

document.getElementById("closeShare").onclick = () => {
  shareModal.classList.remove("active");
};

document.getElementById("copyLink").onclick = async () => {

  const input = document.getElementById("shareLink");

  try {

    await navigator.clipboard.writeText(input.value);

    showToast("Share link copied");

  } catch {

    input.select();
    document.execCommand("copy");

    showToast("Share link copied");
  }
};

document.getElementById("nativeShare").onclick = async () => {

  const link = document.getElementById("shareLink").value;

  if (navigator.share) {

    await navigator.share({
      title: "LayerForge Design",
      text: "Check out my design",
      url: link
    });

  } else {

    await navigator.clipboard.writeText(link);

    showToast("Link copied");
  }
};

/* =========================================================
   LOAD SHARED DESIGN
========================================================= */

function loadSharedDesign() {

  const params = new URLSearchParams(window.location.search);

  const encoded = params.get("design");

  if (!encoded) return;

  try {

    const json = decodeURIComponent(encoded);

    const data =
      decodeURIComponent(
        escape(
          atob(json)
        )
      );

    canvas.loadFromJSON(JSON.parse(data), () => {

      canvas.renderAll();

      updateLayers();
      updateProperties();
      updateEmptyState();

      showToast("Shared design loaded");
    });

  } catch (error) {

    console.error(error);
    showToast("Could not load shared design");
  }
}

/* =========================================================
   INIT
========================================================= */

canvas.backgroundColor = "#111827";

updateZoom();
updateEmptyState();
updateLayers();
updateProperties();

saveHistory();

loadSavedDesign();
loadSharedDesign();

console.log("LayerForge initialized.");
