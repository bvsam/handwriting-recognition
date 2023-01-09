class Model {
  constructor() {
    this.alphabet = "abcdefghijklmnopqrstuvwxyz";
    this.characters =
      "0123456789" + this.alphabet.toUpperCase() + this.alphabet;
    this.loadModel();
  }

  async loadModel() {
    console.log("Loading model...");
    this._model = await tf.loadLayersModel("jsModel/model.json");
    document.getElementById("userInput").placeholder =
      "Draw a digit or letter below";
    console.log("Model loaded.");
  }

  preprocessImage(pixelData) {
    const targetDim = 28,
      edgeSize = 2,
      resizeDim = targetDim - edgeSize * 2,
      padVertically = pixelData.width > pixelData.height,
      padSize = Math.round(
        (Math.max(pixelData.width, pixelData.height) -
          Math.min(pixelData.width, pixelData.height)) /
          2
      ),
      padSquare = padVertically
        ? [
            [padSize, padSize],
            [0, 0],
            [0, 0],
          ]
        : [
            [0, 0],
            [padSize, padSize],
            [0, 0],
          ];

    let tempImg = null;

    if (tempImg) tempImg.dispose();

    return tf.tidy(() => {
      let tensor = tf.browser.fromPixels(pixelData, 1).pad(padSquare, 255.0);

      tensor = tf.image.resizeBilinear(tensor, [resizeDim, resizeDim]).pad(
        [
          [edgeSize, edgeSize],
          [edgeSize, edgeSize],
          [0, 0],
        ],
        255.0
      );

      tensor = tf.scalar(1.0).sub(tensor.toFloat().div(tf.scalar(255.0)));

      tempImg = tf.keep(tf.clone(tensor));

      return tensor.expandDims(0);
    });
  }

  predict(pixelData) {
    if (!this._model) {
      return console.warn(
        "Prediction cannot be made. Model has not loaded yet."
      );
    }
    const tensor = this.preprocessImage(pixelData);
    const prediction = this._model.predict(tensor).as1D();
    const argMax = prediction.argMax().dataSync()[0];
    const probability = prediction.max().dataSync()[0];
    const character = this.characters[argMax];
    return [character, probability];
  }
}
