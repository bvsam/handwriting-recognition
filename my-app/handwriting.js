class Handwriting {
  constructor() {
    this.model = new Model();
    this.canvas = new fabric.Canvas("handwriting", {
      backgroundColor: "#fff",
      isDrawingMode: true,
    });
    this.canvas.freeDrawingBrush.width = 30;
    this.setup();
    this.resizeCanvas();
    this.canvas.freeDrawingBrush.color = "#000";
    window.onresize = this.resizeCanvas.bind(this);
  }

  setup() {
    let timer = null;
    let hasTimedOut = false;

    this.canvas
      .on("mouse:down", () => {
        if (hasTimedOut) {
          this.resetCanvas();
        }
        hasTimedOut = false;
        clearTimeout(timer);
        timer = null;
      })
      .on("mouse:up", () => {
        timer = setTimeout(() => {
          hasTimedOut = true;
          let [character, probability] = this.model.predict(
            this.captureDrawing()
          );
          this.appendInput(character);
          console.log(character, probability);
        }, 800);
      });
  }

  resizeCanvas() {
    // Resize the canvas to fit the window using the offsetWidth of the html element
    if (this.canvas.width !== document.documentElement.offsetWidth) {
      this.canvas.setWidth(document.documentElement.offsetWidth);
    }
    // Resize the canvas to fit the window using the offsetHeight of the html element and the topBar div
    if (this.canvas.height !== window.innerHeight) {
      let topBarHeight = document.querySelector("#topBar").offsetHeight;
      this.canvas.setHeight(window.innerHeight - topBarHeight);
    }
    this.canvas.calcOffset();
    this.canvas.renderAll();
  }

  resetCanvas() {
    this.canvas.clear();
    this.canvas.backgroundColor = "#fff";
  }

  captureDrawing() {
    let group = new fabric.Group(this.canvas.getObjects());
    let { left, top, width, height } = group;
    let scale = window.devicePixelRatio;
    let image = this.canvas.contextContainer.getImageData(
      left * scale,
      top * scale,
      width * scale,
      height * scale
    );
    this.resetCanvas();

    return image;
  }

  appendInput(character) {
    let input = document.querySelector("#userInput");
    input.value += character;
  }
}
const handwriting = new Handwriting();
