class Handwriting {
  constructor() {
    // Initialize the stored CNN model
    this.model = new Model();
    // Create a new canvas bound to the canvas element with id "handwriting"
    this.canvas = new fabric.Canvas("handwriting", {
      // Set the background color of the canvas to white and the canvas to be interactive
      backgroundColor: "#fff",
      isDrawingMode: true,
    });
    this.canvas.freeDrawingBrush.width = 30;
    // Set the canvas to be responsive
    this.setup();
    // Resize the canvas to fit the window
    this.resizeCanvas();
    this.canvas.freeDrawingBrush.color = "#000";
    // Add an event listener to the window to resize the canvas when the window is resized
    window.onresize = this.resizeCanvas.bind(this);
  }

  setup() {
    // Create a variable to store timers
    let timer = null;
    // Track whether the timer has timed out
    let hasTimedOut = false;

    // Add event listeners to the canvas
    this.canvas
      .on("mouse:down", () => {
        // When the mouse is pressed down, check to see if the canvas was previously timed out
        // If so, clear it
        if (hasTimedOut) {
          this.resetCanvas();
        }
        // Reset hasTimedOut and clear the timer since the user is now drawing
        hasTimedOut = false;
        clearTimeout(timer);
        timer = null;
      })
      .on("mouse:up", () => {
        // Once the user is no longer drawing, set a timeout for 800ms
        timer = setTimeout(() => {
          // Once 800ms has passed, keep track that the user has timed out
          hasTimedOut = true;
          // Capture the drawing and use the model to predict the character drawn
          // and get its confidence/likelihoood
          let [character, probability] = this.model.predict(
            this.captureDrawing()
          );
          // Append the character to the input field
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
    // Reset the canvas by clearing it and setting the background color to white
    this.canvas.clear();
    this.canvas.backgroundColor = "#fff";
  }

  captureDrawing() {
    // Get the bounding box of the drawing
    let group = new fabric.Group(this.canvas.getObjects());
    // Get the drawing's width, height and the coordinates of its top left corner
    let { left, top, width, height } = group;
    // Scale the image data according to the device pixel ratio
    let scale = window.devicePixelRatio;
    let image = this.canvas.contextContainer.getImageData(
      left * scale,
      top * scale,
      width * scale,
      height * scale
    );
    // Reset the canvas
    this.resetCanvas();

    return image;
  }

  appendInput(character) {
    // Append the character to the input field
    let input = document.querySelector("#userInput");
    input.value += character;
  }
}
const handwriting = new Handwriting();
