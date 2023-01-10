class Model {
  constructor() {
    // Define the characters that the model can predict
    this.alphabet = "abcdefghijklmnopqrstuvwxyz";
    this.characters =
      "0123456789" + this.alphabet.toUpperCase() + this.alphabet;
    // Load the model
    this.loadModel();
  }

  async loadModel() {
    console.log("Loading model...");
    // Load the model from the model.json file containing its architecture
    this._model = await tf.loadLayersModel("jsModel/model.json");
    // Change the placeholder text in the input field to indicate that the model has loaded
    document.getElementById("userInput").placeholder =
      "Draw a digit or letter below";
    console.log("Model loaded.");
  }

  preprocessImage(pixelData) {
    /*
    This method preprocesses the pixel data of the image drawn to better match it to the training data of the trained model.
    Preprocessing the pixel data allows the model to predict the image drawn more accuractely.
    */

    // targetDim: The target dimension of the image (the model was trained on 28x28 images)
    const targetDim = 28;
    // edgeSize: The number of pixels to pad the image with to liken the final image to the training data, which has each
    // number/letter padded with black pixels
    const edgeSize = 2;
    // resizeDim: The length of the square image after resizing (without padding)
    const resizeDim = targetDim - edgeSize * 2;
    // padVertically: Whether or not the image should be padded vertically or horizontally
    // If the image is wider than it is tall, pad it vertically
    const padVertically = pixelData.width > pixelData.height;
    // padSize: The number of pixels to pad the shorter side of the image with.
    // This is calculated by taking the difference between the larger side and the smaller side of the image and dividing it by 2
    const padSize = Math.round(
      (Math.max(pixelData.width, pixelData.height) -
        Math.min(pixelData.width, pixelData.height)) /
        2
    );
    // padSquare: The padding to apply to the image, represented as a 3x2 array (height, width, channels)
    // Pad the image's shorter side (width or height) with padSize pixels
    const padSquare = padVertically
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

    // Perform the following with tf.tidy() to clean up tensors that are not returned
    return tf.tidy(() => {
      // Convert the pixel data to a tensor with one channel
      // Then pad it using the values from padSquare (pad with white to match the canvas)
      let tensor = tf.browser.fromPixels(pixelData, 1).pad(padSquare, 255.0);

      // Resize the image to the resizeDim dimension, then pad it on all sides with white (to match the canvas)
      // to make the final image the same size as the training data (28x28)
      tensor = tf.image.resizeBilinear(tensor, [resizeDim, resizeDim]).pad(
        [
          [edgeSize, edgeSize],
          [edgeSize, edgeSize],
          [0, 0],
        ],
        255.0
      );

      // Normalize the image and invert it by dividing each pixel by 255 (white), then subtracting each pixel from 1
      // pixelValue = 1 - (pixelValue / 255)
      tensor = tf.scalar(1.0).sub(tensor.toFloat().div(tf.scalar(255.0)));

      // Expand the dimensions of the tensor to match the input shape of the model
      // This converts the tensor's shape from (28, 28, 1) to (1, 28, 28, 1)
      return tensor.expandDims(0);
    });
  }

  predict(pixelData) {
    // Create a warning message in the console and return if a prediction is being made even though
    // the model has not loaded yet (for some reason)
    if (!this._model) {
      return console.warn(
        "Prediction cannot be made. Model has not loaded yet."
      );
    }
    // Preprocess the image data
    const tensor = this.preprocessImage(pixelData);
    // Predict the image using the trained model
    const prediction = this._model.predict(tensor).as1D();
    // Get the index of the item with the maximum value in prediction
    const argMax = prediction.argMax().dataSync()[0];
    // Get the probability of the inference inside prediction using argMax
    const probability = prediction.max().dataSync()[0];
    // Get the character that corresponds to the index of the item with the maximum value in prediction
    const character = this.characters[argMax];
    // Return the character and its probability according to the model
    return [character, probability];
  }
}
