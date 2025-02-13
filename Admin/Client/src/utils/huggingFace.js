// huggingFace.js
import { HfInference } from "@huggingface/inference";

const hf = new HfInference("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");

// Intent detection model
const intentDetectionModel = "distilbert-base-uncased";

// Entity extraction model
const entityExtractionModel = "dbmdz/bert-large-cased-finetuned-conll03-english";

// Detect user intent
export const detectIntent = async (text) => {
    const response = await hf.textClassification({
        model: intentDetectionModel,
        inputs: text,
    });
    return response[0].label; // Returns the predicted intent
};

// Extract entities from user input
export const extractEntities = async (text) => {
    const response = await hf.tokenClassification({
        model: entityExtractionModel,
        inputs: text,
    });
    return response; // Returns extracted entities
};