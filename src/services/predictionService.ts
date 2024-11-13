import * as tf from "@tensorflow/tfjs";
import getMonthlyStats from "../queries/getMonthlyStats";
import { PrismaClient } from "@prisma/client";
// @ts-ignore
// import { model, createSequences } from "./loadModel";

class StandardScaler {
  mean: any;
  std: any;
  constructor() {
    this.mean = null;
    this.std = null;
  }

  // Fit the scaler to calculate mean and std for each column
  fit(data: tf.Tensor) {
    this.mean = data.mean(0); // Mean across each column
    this.std = data.sub(this.mean).square().mean(0).sqrt(); // Std dev across each column
  }

  // Transform the data by scaling with the calculated mean and std
  transform(data: tf.Tensor) {
    if (!this.mean || !this.std) {
      throw new Error("Must fit the scaler before transforming data.");
    }
    return data.sub(this.mean).div(this.std);
  }

  // Fit and transform the data in one step
  fitTransform(data: tf.Tensor) {
    this.fit(data);
    return this.transform(data);
  }

  // Inverse transform to return to original values
  inverseTransform(scaledData: tf.Tensor) {
    if (!this.mean || !this.std) {
      throw new Error(
        "Must fit the scaler before performing inverse transform."
      );
    }
    return scaledData.mul(this.std).add(this.mean);
  }
}

type NestedNumber =
  | number
  | number[]
  | number[][]
  | number[][][]
  | number[][][][]
  | number[][][][][]
  | number[][][][][][];

function parseResultDataType(input: NestedNumber): number[][] {
  const result: number[][] = [];

  function parseDataType(item: NestedNumber): void {
    if (
      Array.isArray(item) &&
      item.every((subItem) => typeof subItem === "number")
    ) {
      result.push(item as number[]);
    } else if (Array.isArray(item)) {
      item.forEach((subItem) => parseDataType(subItem));
      // console.log(item)
    }
  }

  parseDataType(input);
  return result;
}

const prisma = new PrismaClient();

export default async function predictionService(date: Date) {

  // Check the date.

  const rawDatas = await getMonthlyStats();

  const preparedDatas = [];

  for (let index = 0; index < rawDatas.length; index++) {
    const preparedData = [
      rawDatas[index].w1_temp,
      rawDatas[index].w1_luxh,
      rawDatas[index].w1_hum,
      rawDatas[index].w2_ws_max,
      rawDatas[index].w2_ws_avg,

    ];

    preparedDatas.push(preparedData);
  }

  console.log(preparedDatas)

  const stringDate = `${date.toISOString().substring(0, 7)}%`;

  const checkPreviousMonthRecord: any = await prisma.$queryRaw`
                                      SELECT * FROM "PredictionsHistory" WHERE "created_at"::TEXT LIKE ${stringDate}
                                   `;

  if (Array.isArray(checkPreviousMonthRecord), checkPreviousMonthRecord.length > 0) {
    return checkPreviousMonthRecord;
  }
  const standardScaler: StandardScaler = new StandardScaler();

  

  const model = await tf.loadLayersModel(
    "https://planting-prediction.petanitech.com/storage/tfjs_model/model.json"
  );

  const tensorData = tf.tensor(preparedDatas);

  const scaledData = standardScaler.fitTransform(tensorData);

  const reshaped = scaledData.reshape([1, 30, 2]);

  const prediction = model.predict(reshaped) as tf.Tensor;

  const result = standardScaler.inverseTransform(prediction.reshape([-1, 2]));

  const parsedResultDataType = parseResultDataType(await result.array());
console.log(preparedDatas)
  return preparedDatas;
}
