import * as tf from "@tensorflow/tfjs";

class L2 {
  static className = "L2";

  constructor(config) {
    return tf.regularizers.l1l2(config);
  }
}
tf.serialization.registerClass(L2);

async function loadModel() {
  const model = await tf.loadLayersModel(
    "https://planting-prediction.petanitech.com/storage/prediksi_model/model.json"
  );
  return model;
}

let model;

async function main() {
    const loadedModel = await loadModel();

    model = loadedModel;
}

main();

function createSequences(dataX, nSteps = 30) {
    const Xs = [];
  
    for (let i = 0; i < dataX.length - nSteps; i++) {
      // Create a slice of the data for each sequence
      Xs.push(dataX.slice(i, i + nSteps));
    }
  
    return Xs;
  }

export {model, createSequences};
