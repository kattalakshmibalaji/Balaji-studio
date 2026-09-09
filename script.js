/* =========================================
   LAYERFORGE EDITOR
========================================= */
alert("JavaScript is working!");
console.log("LayerForge JS loaded");
console.log("LayerForge starting...");

/* Make sure Fabric loaded */

if (typeof fabric === "undefined") {

  alert(
    "Fabric.js could not load. Check your internet connection and reload the page."
  );

  throw new Error("Fabric.js not loaded");

}

/* =========================================
   CANVAS
========================================= */

const canvas = new fabric.Canvas("canvas", {
  preserveObjectStacking: true,
  selection: true
});

canvas.backgroundColor = "#111827";
canvas.renderAll();

/* =========================================
   VARIABLES
========================================= */

let zoom = 1;

let history = [];

let historyPosition = -1;

let changingHistory = false;

/* =========================================
   ELEMENTS
========================================= */

const welcome =
  document.getElementById("welcome");

const toast =
  document.getElementById("toast");

const layersList =
  document.getElementById("layersList");

const nothing =
  document.getElementById("nothing");

const textProperties =
  document.getElementById("textProperties");

const objectProperties =
  document.getElementById("objectProperties");

/* =========================================
   TOAST
========================================= */

function notify(message) {

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(notify.timer);

  notify.timer = setTimeout(() => {

    toast.classList.remove("show");

  }, 2000);

}

/* =========================================
   WELCOME SCREEN
========================================= */

function updateWelcome() {

  welcome.style.display =
    canvas.getObjects().length === 0
      ? "block"
      : "none";

}

/* =========================================
   PANELS
========================================= */

document.querySelectorAll(".tool").forEach(button => {

  button.addEventListener("click", () => {

    document.querySelectorAll(".tool")
      .forEach(x => x.classList.remove("active"));

    button.classList.add("active");

    const panelName =
      button.dataset.panel;

    document.querySelectorAll(".panel-page")
      .forEach(page => {
        page.classList.remove("active");
      });

    document.getElementById(panelName)
      .classList.add("active");

  });

});

/* =========================================
   HISTORY
========================================= */

function saveHistory() {

  if (changingHistory) return;

  const state =
    JSON.stringify(canvas.toJSON());

  if (
    historyPosition >= 0 &&
    history[historyPosition] === state
  ) {
    return;
  }

  history =
    history.slice(0, historyPosition + 1);

  history.push(state);

  historyPosition++;

  if (history.length > 30) {

    history.shift();

    historyPosition--;

  }

}

function restoreState(state) {

  changingHistory = true;

  canvas.loadFromJSON(state, () => {

    canvas.renderAll();

    updateLayers();

    updateProperties();

    updateWelcome();

    changingHistory = false;

  });

}

/* =========================================
   UNDO
========================================= */

document.getElementById("undoBtn")
  .addEventListener("click", () => {

    if (historyPosition <= 0) {

      notify("Nothing to undo");

      return;
    }

    historyPosition--;

    restoreState(
      history[historyPosition]
    );

  });

/* =========================================
   REDO
========================================= */

document.getElementById("redoBtn")
  .addEventListener("click", () => {

    if (
      historyPosition >=
      history.length - 1
    ) {

      notify("Nothing to redo");

      return;
    }

    historyPosition++;

    restoreState(
      history[historyPosition]
    );

  });

/* =========================================
   ADD TEXT
========================================= */

function addText(
  value,
  size,
  weight = "normal"
) {

  const text =
    new fabric.IText(value, {

      left:
        canvas.getWidth() / 2,

      top:
        canvas.getHeight() / 2,

      originX: "center",

      originY: "center",

      fill: "#ffffff",

      fontFamily: "Arial",

      fontSize: size,

      fontWeight: weight,

      padding: 5,

      cornerColor: "#7657ff",

      transparentCorners: false

    });

  canvas.add(text);

  canvas.setActiveObject(text);

  canvas.renderAll();

  saveHistory();

  updateLayers();

  updateProperties();

  updateWelcome();

}

document.getElementById("headingBtn")
  .addEventListener("click", () => {

    addText(
      "Your Heading",
      55,
      "bold"
    );

  });

document.getElementById("subheadingBtn")
  .addEventListener("click", () => {

    addText(
      "Your Subheading",
      35
    );

  });

document.getElementById("bodyBtn")
  .addEventListener("click", () => {

    addText(
      "Your text here",
      22
    );

  });

/* =========================================
   UPLOAD
========================================= */

const fileInput =
  document.getElementById("fileInput");

fileInput.addEventListener(
  "change",
  function () {

    const file = this.files[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = function(event) {

      fabric.Image.fromURL(
        event.target.result,
        function(image) {

          const maxWidth =
            canvas.getWidth() * .85;

          const maxHeight =
            canvas.getHeight() * .85;

          const scale =
            Math.min(
              maxWidth / image.width,
              maxHeight / image.height,
              1
            );

          image.set({

            left:
              canvas.getWidth() / 2,

            top:
              canvas.getHeight() / 2,

            originX: "center",

            originY: "center",

            scaleX: scale,

            scaleY: scale,

            cornerColor: "#7657ff",

            transparentCorners: false

          });

          canvas.add(image);

          canvas.setActiveObject(image);

          canvas.renderAll();

          saveHistory();

          updateLayers();

          updateProperties();

          updateWelcome();

          notify("Image added");

        }
      );

    };

    reader.readAsDataURL(file);

    this.value = "";

  }
);

/* Welcome upload */

document.getElementById("welcomeUpload")
  .addEventListener("click", () => {

    fileInput.click();

  });

/* =========================================
   BACKGROUND
========================================= */

document.getElementById("backgroundColor")
  .addEventListener("input", event => {

    canvas.backgroundColor =
      event.target.value;

    canvas.renderAll();

    saveHistory();

  });

document.getElementById(
  "removeBackgroundBtn"
)
.addEventListener("click", () => {

  canvas.backgroundColor =
    "transparent";

  canvas.renderAll();

  saveHistory();

  notify("Background removed");

});

/* =========================================
   RECTANGLE
========================================= */

document.getElementById("rectangleBtn")
  .addEventListener("click", () => {

    const rectangle =
      new fabric.Rect({

        left:
          canvas.getWidth() / 2,

        top:
          canvas.getHeight() / 2,

        originX: "center",

        originY: "center",

        width: 220,

        height: 130,

        rx: 12,

        ry: 12,

        fill: "#7657ff",

        cornerColor: "#ffffff",

        transparentCorners: false

      });

    canvas.add(rectangle);

    canvas.setActiveObject(rectangle);

    canvas.renderAll();

    saveHistory();

    updateLayers();

    updateProperties();

    updateWelcome();

  });

/* =========================================
   CIRCLE
========================================= */

document.getElementById("circleBtn")
  .addEventListener("click", () => {

    const circle =
      new fabric.Circle({

        left:
          canvas.getWidth() / 2,

        top:
          canvas.getHeight() / 2,

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

    updateWelcome();

  });

/* =========================================
   PROPERTIES
========================================= */

function updateProperties() {

  const object =
    canvas.getActiveObject();

  if (!object) {

    nothing.classList.remove("hidden");

    textProperties.classList.add("hidden");

    objectProperties.classList.add("hidden");

    return;

  }

  nothing.classList.add("hidden");

  objectProperties.classList.remove("hidden");

  document.getElementById(
    "opacityInput"
  ).value =
    object.opacity ?? 1;

  document.getElementById(
    "rotationInput"
  ).value =
    object.angle || 0;

  if (object.type === "i-text") {

    textProperties.classList.remove("hidden");

    document.getElementById(
      "textInput"
    ).value =
      object.text || "";

    document.getElementById(
      "fontInput"
    ).value =
      object.fontFamily || "Arial";

    document.getElementById(
      "fontSizeInput"
    ).value =
      object.fontSize || 40;

    if (
      typeof object.fill === "string" &&
      object.fill.startsWith("#")
    ) {

      document.getElementById(
        "textColorInput"
      ).value =
        object.fill;

    }

  } else {

    textProperties.classList.add("hidden");

  }

}

/* =========================================
   TEXT EDITING
========================================= */

document.getElementById("textInput")
  .addEventListener("input", event => {

    const object =
      canvas.getActiveObject();

    if (!object ||
        object.type !== "i-text") return;

    object.set(
      "text",
      event.target.value
    );

    canvas.renderAll();

    saveHistory();

    updateLayers();

  });

document.getElementById("fontInput")
  .addEventListener("change", event => {

    const object =
      canvas.getActiveObject();

    if (!object ||
        object.type !== "i-text") return;

    object.set(
      "fontFamily",
      event.target.value
    );

    canvas.renderAll();

    saveHistory();

  });

document.getElementById("fontSizeInput")
  .addEventListener("change", event => {

    const object =
      canvas.getActiveObject();

    if (!object ||
        object.type !== "i-text") return;

    object.set(
      "fontSize",
      Number(event.target.value)
    );

    canvas.renderAll();

    saveHistory();

  });

document.getElementById("textColorInput")
  .addEventListener("input", event => {

    const object =
      canvas.getActiveObject();

    if (!object) return;

    object.set(
      "fill",
      event.target.value
    );

    canvas.renderAll();

    saveHistory();

  });

/* =========================================
   TEXT FORMAT
========================================= */

document.getElementById("boldBtn")
  .addEventListener("click", () => {

    const object =
      canvas.getActiveObject();

    if (!object ||
        object.type !== "i-text") return;

    object.set(
      "fontWeight",
      object.fontWeight === "bold"
        ? "normal"
        : "bold"
    );

    canvas.renderAll();

    saveHistory();

  });

document.getElementById("italicBtn")
  .addEventListener("click", () => {

    const object =
      canvas.getActiveObject();

    if (!object ||
        object.type !== "i-text") return;

    object.set(
      "fontStyle",
      object.fontStyle === "italic"
        ? "normal"
        : "italic"
    );

    canvas.renderAll();

    saveHistory();

  });

document.getElementById("underlineBtn")
  .addEventListener("click", () => {

    const object =
      canvas.getActiveObject();

    if (!object ||
        object.type !== "i-text") return;

    object.set(
      "underline",
      !object.underline
    );

    canvas.renderAll();

    saveHistory();

  });

/* =========================================
   OPACITY
========================================= */

document.getElementById("opacityInput")
  .addEventListener("input", event => {

    const object =
      canvas.getActiveObject();

    if (!object) return;

    object.set(
      "opacity",
      Number(event.target.value)
    );

    canvas.renderAll();

  });

/* =========================================
   ROTATION
========================================= */

document.getElementById("rotationInput")
  .addEventListener("input", event => {

    const object =
      canvas.getActiveObject();

    if (!object) return;

    object.set(
      "angle",
      Number(event.target.value)
    );

    canvas.renderAll();

  });

/* =========================================
   DELETE
========================================= */

function deleteSelected() {

  const object =
    canvas.getActiveObject();

  if (!object) {

    notify("Select an element first");

    return;

  }

  canvas.remove(object);

  canvas.discardActiveObject();

  canvas.renderAll();

  saveHistory();

  updateLayers();

  updateProperties();

  updateWelcome();

  notify("Deleted");

}

document.getElementById("deleteBtn")
  .addEventListener(
    "click",
    deleteSelected
  );

/* Keyboard delete */

document.addEventListener("keydown", event => {

  if (
    event.key === "Delete" ||
    event.key === "Backspace"
  ) {

    const object =
      canvas.getActiveObject();

    if (
      object &&
      !object.isEditing
    ) {

      deleteSelected();

    }

  }

});

/* =========================================
   LAYERS
========================================= */

function updateLayers() {

  layersList.innerHTML = "";

  const objects =
    canvas.getObjects();

  [...objects]
    .reverse()
    .forEach(object => {

      const layer =
        document.createElement("div");

      layer.className = "layer";

      if (
        object ===
        canvas.getActiveObject()
      ) {

        layer.classList.add("selected");

      }

      let name = "Element";

      if (object.type === "i-text") {

        name =
          object.text || "Text";

      } else if (
        object.type === "image"
      ) {

        name = "Image";

      } else if (
        object.type === "rect"
      ) {

        name = "Rectangle";

      } else if (
        object.type === "circle"
      ) {

        name = "Circle";

      }

      layer.textContent =
        name.substring(0, 25);

      layer.addEventListener(
        "click",
        () => {

          canvas.setActiveObject(object);

          canvas.renderAll();

          updateLayers();

          updateProperties();

        }
      );

      layersList.appendChild(layer);

    });

}

/* =========================================
   CANVAS EVENTS
========================================= */

canvas.on(
  "selection:created",
  () => {

    updateLayers();
    updateProperties();

  }
);

canvas.on(
  "selection:updated",
  () => {

    updateLayers();
    updateProperties();

  }
);

canvas.on(
  "selection:cleared",
  () => {

    updateLayers();
    updateProperties();

  }
);

canvas.on(
  "object:modified",
  () => {

    saveHistory();

    updateLayers();

    updateProperties();

  }
);

canvas.on(
  "object:removed",
  () => {

    updateLayers();

    updateWelcome();

  }
);

/* =========================================
   ZOOM
========================================= */

function updateZoom() {

  canvas.setZoom(zoom);

  document.getElementById(
    "zoomText"
  ).textContent =
    `${Math.round(zoom * 100)}%`;

  canvas.renderAll();

}

document.getElementById("zoomPlus")
  .addEventListener("click", () => {

    zoom =
      Math.min(
        zoom + .1,
        2
      );

    updateZoom();

  });

document.getElementById("zoomMinus")
  .addEventListener("click", () => {

    zoom =
      Math.max(
        zoom - .1,
        .3
      );

    updateZoom();

  });

/* =========================================
   SAVE
========================================= */

document.getElementById("saveBtn")
  .addEventListener("click", () => {

    const data = {

      name:
        document.getElementById(
          "designName"
        ).value,

      canvas:
        canvas.toJSON(),

      background:
        canvas.backgroundColor

    };

    localStorage.setItem(
      "layerforge-design",
      JSON.stringify(data)
    );

    notify("Design saved");

  });

/* =========================================
   NEW
========================================= */

document.getElementById("newBtn")
  .addEventListener("click", () => {

    canvas.clear();

    canvas.backgroundColor =
      "#111827";

    canvas.renderAll();

    document.getElementById(
      "designName"
    ).value =
      "Untitled Design";

    history = [];

    historyPosition = -1;

    saveHistory();

    updateLayers();

    updateProperties();

    updateWelcome();

    notify("New design");

  });

/* =========================================
   EXPORT
========================================= */

document.getElementById("exportBtn")
  .addEventListener("click", () => {

    const image =
      canvas.toDataURL({

        format: "png",

        multiplier: 2

      });

    const link =
      document.createElement("a");

    link.download =
      "layerforge-design.png";

    link.href = image;

    link.click();

    notify("Design exported");

  });

/* =========================================
   TEMPLATES
========================================= */

document.querySelectorAll(".template")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const type =
          button.dataset.template;

        canvas.clear();

        canvas.backgroundColor =
          "#111827";

        if (type === "sale") {

          canvas.backgroundColor =
            "#ef4444";

          addText(
            "BIG SALE",
            55,
            "bold"
          );

          const discount =
            new fabric.IText(
              "50% OFF",
              {
                left: 450,
                top: 300,

                originX: "center",
                originY: "center",

                fill: "#ffffff",

                fontFamily: "Arial",

                fontSize: 85,

                fontWeight: "bold"
              }
            );

          canvas.add(discount);

          const shop =
            new fabric.IText(
              "SHOP NOW",
              {
                left: 450,
                top: 430,

                originX: "center",
                originY: "center",

                fill: "#111111",

                backgroundColor: "#ffffff",

                fontSize: 24,

                fontWeight: "bold",

                padding: 10
              }
            );

          canvas.add(shop);

        }

        if (type === "event") {

          canvas.backgroundColor =
            "#312e81";

          addText(
            "LIVE EVENT",
            35,
            "bold"
          );

          const tonight =
            new fabric.IText(
              "TONIGHT",
              {
                left: 450,
                top: 300,

                originX: "center",
                originY: "center",

                fill: "#a78bfa",

                fontSize: 85,

                fontWeight: "bold"
              }
            );

          canvas.add(tonight);

          const time =
            new fabric.IText(
              "7:00 PM",
              {
                left: 450,
                top: 420,

                originX: "center",
                originY: "center",

                fill: "#ffffff",

                fontSize: 30
              }
            );

          canvas.add(time);

        }

        if (type === "social") {

          canvas.backgroundColor =
            "#047857";

          addText(
            "YOUR",
            45,
            "bold"
          );

          const story =
            new fabric.IText(
              "STORY",
              {
                left: 450,
                top: 310,

                originX: "center",
                originY: "center",

                fill: "#ffffff",

                fontSize: 90,

                fontWeight: "bold"
              }
            );

          canvas.add(story);

        }

        canvas.renderAll();

        saveHistory();

        updateLayers();

        updateProperties();

        updateWelcome();

        notify("Template loaded");

      }
    );

  });

/* =========================================
   SHARE
========================================= */

document.getElementById("shareBtn")
  .addEventListener("click", () => {

    const design =
      JSON.stringify(
        canvas.toJSON()
      );

    const encoded =
      btoa(
        encodeURIComponent(design)
      );

    const link =
      window.location.origin +
      window.location.pathname +
      "?design=" +
      encoded;

    document.getElementById(
      "shareInput"
    ).value =
      link;

    document.getElementById(
      "shareModal"
    ).classList.add("show");

  });

/* Close modal */

document.getElementById("closeModal")
  .addEventListener("click", () => {

    document.getElementById(
      "shareModal"
    ).classList.remove("show");

  });

/* Copy */

document.getElementById("copyBtn")
  .addEventListener("click", async () => {

    const input =
      document.getElementById(
        "shareInput"
      );

    try {

      await navigator.clipboard
        .writeText(input.value);

      notify("Link copied");

    } catch {

      input.select();

      document.execCommand("copy");

      notify("Link copied");

    }

  });

/* =========================================
   LOAD SHARED DESIGN
========================================= */

function loadSharedDesign() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const encoded =
    params.get("design");

  if (!encoded) return;

  try {

    const json =
      decodeURIComponent(
        atob(encoded)
      );

    canvas.loadFromJSON(
      JSON.parse(json),
      () => {

        canvas.renderAll();

        updateLayers();

        updateProperties();

        updateWelcome();

        notify("Shared design loaded");

      }
    );

  } catch(error) {

    console.error(
      "Shared design error:",
      error
    );

  }

}

/* =========================================
   STARTUP
========================================= */

saveHistory();

updateZoom();

updateLayers();

updateProperties();

updateWelcome();

loadSharedDesign();

console.log(
  "LayerForge ready!"
);
