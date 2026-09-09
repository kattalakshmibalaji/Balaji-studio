// ========================================
// BALAJI STUDIO - EDITOR
// ========================================

// Create canvas
const canvas = new fabric.Canvas("canvas", {
  width: 360,
  height: 640,
  backgroundColor: "#ffffff"
});


// ========================================
// UPLOAD DESIGN
// ========================================

document
  .getElementById("imageUpload")
  .addEventListener("change", function (event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

      fabric.FabricImage
        .fromURL(e.target.result)
        .then(function (img) {

          // Remove previous objects
          canvas.clear();

          // Fit image inside canvas
          const scaleX = canvas.width / img.width;
          const scaleY = canvas.height / img.height;

          const scale = Math.min(scaleX, scaleY);

          img.scale(scale);

          img.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: "center",
            originY: "center",

            // Background image cannot be selected
            selectable: false,
            evented: false
          });

          canvas.add(img);

          canvas.renderAll();

        });

    };

    reader.readAsDataURL(file);

  });


// ========================================
// ADD TEXT
// ========================================

document
  .getElementById("addText")
  .addEventListener("click", function () {

    const text = new fabric.IText("Edit this text", {

      left: 80,
      top: 100,

      fontSize: 32,

      fill: document
        .getElementById("textColor")
        .value,

      fontFamily: "Arial",

      fontWeight: "bold",

      editable: true
    });

    canvas.add(text);

    canvas.setActiveObject(text);

    canvas.renderAll();

  });


// ========================================
// CHANGE TEXT COLOR
// ========================================

document
  .getElementById("textColor")
  .addEventListener("input", function (event) {

    const object = canvas.getActiveObject();

    if (!object) return;

    if (
      object.type === "i-text" ||
      object.type === "text" ||
      object.type === "textbox"
    ) {

      object.set("fill", event.target.value);

      canvas.renderAll();

    }

  });


// ========================================
// DELETE SELECTED OBJECT
// ========================================

document
  .getElementById("deleteObject")
  .addEventListener("click", function () {

    const object = canvas.getActiveObject();

    if (!object) {
      alert("Select something first.");
      return;
    }

    canvas.remove(object);

    canvas.discardActiveObject();

    canvas.renderAll();

  });


// ========================================
// CLEAR CANVAS
// ========================================

document
  .getElementById("clearCanvas")
  .addEventListener("click", function () {

    const confirmClear =
      confirm("Do you want to clear the design?");

    if (!confirmClear) return;

    canvas.clear();

    canvas.backgroundColor = "#ffffff";

    canvas.renderAll();

  });


// ========================================
// DOWNLOAD
// ========================================

document
  .getElementById("download")
  .addEventListener("click", function () {

    const image = canvas.toDataURL({
      format: "png",
      multiplier: 2
    });

    const link = document.createElement("a");

    link.href = image;

    link.download = "balaji-studio-template.png";

    link.click();

  });
