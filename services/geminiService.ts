// Import necessary types and classes from the Google GenAI SDK.
import { GoogleGenAI, Type } from "@google/genai";
// Import the custom types defined for our application.
import type { RepairGuide, GeminiJsonPlan, TutorialStep } from "../types";

/**
 * Converts a File object to a Base64 encoded string.
 * This is necessary to send the image data in a JSON payload to the Gemini API.
 * @param file The image file selected by the user.
 * @returns A Promise that resolves with the Base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		// Read the file as a Data URL, which includes the Base64 string.
		reader.readAsDataURL(file);
		// When the file is loaded, resolve the promise.
		reader.onload = () => {
			const result = reader.result as string;
			// The result is a full Data URL (e.g., "data:image/jpeg;base64,ABC...").
			// We only need the part after the comma, which is the Base64 data itself.
			resolve(result.split(",")[1]);
		};
		// If there's an error reading the file, reject the promise.
		reader.onerror = (error) => reject(error);
	});
};

/**
 * Gets the MIME type of a file (e.g., "image/jpeg", "image/png").
 * @param file The file object.
 * @returns The MIME type as a string.
 */
const getMimeType = (file: File): string => {
	return file.type;
};

/**
 * The main service function to generate a complete repair guide.
 * It orchestrates a two-step process:
 * 1. Generate a JSON plan (text descriptions and image prompts) using Gemini Pro.
 * 2. Generate an image for each step in the plan using Imagen.
 * @param problemDescription The user's text description of the problem.
 * @param imageFile The user's uploaded image of the broken item.
 * @param updateLoadingMessage A callback function to update the loading message on the UI.
 * @returns A Promise that resolves with the complete RepairGuide object.
 */
export const generateRepairGuide = async (
	problemDescription: string,
	imageFile: File,
	updateLoadingMessage: (message: string) => void
): Promise<RepairGuide> => {
	// Ensure the API key is available.
	if (!process.env.API_KEY) {
		throw new Error("API_KEY environment variable is not set.");
	}
	// Initialize the Google GenAI client.
	const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

	// --- Step 1: Generate the repair plan (JSON) ---
	updateLoadingMessage("Analyzing item and planning repair...");
	// Convert the image file to Base64 and get its MIME type.
	const base64Image = await fileToBase64(imageFile);
	const mimeType = getMimeType(imageFile);

	// The prompt for the first API call, asking for a structured JSON plan.
	const planningPrompt = `
    You are an expert DIY repair assistant. Analyze the user's image of a broken item and their problem description to create a step-by-step visual repair guide.

    Problem Description: "${problemDescription}"

    Your output must be a JSON object that adheres to the provided schema.
    - Generate between 3 and 5 total steps.
    - The first step should always detail the necessary tools. If no tools are needed, make it the first action of the repair.
    - 'imagePrompt' must be descriptive enough for a text-to-image model to generate a clear, helpful, photorealistic image.
    - 'description' must be simple and easy for a beginner to understand.
  `;

	// Call the Gemini Pro model to generate the plan.
	const planningResponse = await ai.models.generateContent({
		model: "gemini-2.5-pro",
		// Provide the image and the text prompt as parts of the content.
		contents: {
			parts: [
				{ inlineData: { mimeType, data: base64Image } },
				{ text: planningPrompt },
			],
		},
		// Configure the model to return a JSON object that matches our defined schema.
		// This is more reliable than asking for JSON in the prompt and parsing it manually.
		config: {
			responseMimeType: "application/json",
			responseSchema: {
				type: Type.OBJECT,
				properties: {
					safetyWarning: {
						type: Type.STRING,
						description:
							"A clear, concise safety warning if applicable (e.g., 'Unplug the device before starting.'), otherwise null.",
					},
					steps: {
						type: Type.ARRAY,
						description: "A list of steps for the repair guide.",
						items: {
							type: Type.OBJECT,
							properties: {
								stepNumber: {
									type: Type.INTEGER,
									description: "The sequential step number.",
								},
								description: {
									type: Type.STRING,
									description:
										"Textual description of the step. The first step should describe tools needed.",
								},
								imagePrompt: {
									type: Type.STRING,
									description:
										"A detailed prompt for an AI image generator to create a photorealistic image for this step.",
								},
							},
							required: ["stepNumber", "description", "imagePrompt"],
						},
					},
				},
				required: ["safetyWarning", "steps"],
			},
		},
	});

	// Extract the text part of the response, which should be our JSON string.
	const jsonString = planningResponse.text.trim();

	let plan: GeminiJsonPlan;
	try {
		// Parse the JSON string into a JavaScript object.
		plan = JSON.parse(jsonString);
	} catch {
		// If parsing fails, the model didn't return valid JSON. Throw an error.
		console.error("Failed to parse JSON from planning model:", jsonString);
		throw new Error("The AI returned an unexpected format. Please try again.");
	}

	// --- Step 2: Generate images for each step ---
	const generatedSteps: TutorialStep[] = [];
	// Loop through each step in the generated plan.
	for (const [index, step] of plan.steps.entries()) {
		updateLoadingMessage(
			`Generating image for step ${index + 1} of ${plan.steps.length}...`
		);

		// Call the Imagen model to generate an image based on the prompt from the plan.
		const imageGenerationResponse = await ai.models.generateImages({
			model: "imagen-4.0-generate-001",
			prompt: step.imagePrompt,
			config: {
				numberOfImages: 1, // We only need one image per step.
				outputMimeType: "image/jpeg", // Specify the output format.
				aspectRatio: "4:3", // A standard aspect ratio for the tutorial images.
			},
		});

		// Error handling in case the image generation fails.
		if (
			!imageGenerationResponse.generatedImages ||
			imageGenerationResponse.generatedImages.length === 0
		) {
			throw new Error(
				`Failed to generate an image for step ${step.stepNumber}.`
			);
		}

		// The image data is returned as a Base64 string.
		const base64ImageData =
			imageGenerationResponse.generatedImages[0].image.imageBytes;
		// Create a Data URL from the Base64 string so it can be used in an `<img>` tag.
		const imageUrl = `data:image/jpeg;base64,${base64ImageData}`;

		// Add the completed step (with its generated image URL) to our array.
		generatedSteps.push({
			stepNumber: step.stepNumber,
			description: step.description,
			imageUrl: imageUrl,
		});
	}

	// Assemble and return the final RepairGuide object.
	return {
		safetyWarning: plan.safetyWarning,
		steps: generatedSteps,
	};
};
