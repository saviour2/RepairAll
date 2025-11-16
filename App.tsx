import React, { useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { generateRepairGuide } from "./services/geminiService";
import type { RepairGuide } from "./types";
import LoadingSpinner from "./components/LoadingSpinner";
import UploadIcon from "./components/icons/UploadIcon";
import SparklesIcon from "./components/icons/SparklesIcon";
import ErrorIcon from "./components/icons/ErrorIcon";
import LogoutIcon from "./components/icons/LogoutIcon";
import Logo from "./components/icons/Logo";

/**
 * A reusable UI component that provides a styled "glassmorphism" card effect.
 * It's a semi-transparent card with a blurred background and a border.
 * @param children The content to be rendered inside the card.
 * @param className Additional CSS classes to apply to the card.
 */
const GlassCard: React.FC<{
	children: React.ReactNode;
	className?: string;
}> = ({ children, className }) => (
	<div
		className={`bg-slate-900/40 backdrop-blur-xl border border-slate-700/80 p-8 rounded-2xl shadow-2xl shadow-black/20 ${className}`}
	>
		{children}
	</div>
);

// The main component for the entire application.
const App: React.FC = () => {
	// --- Authentication State ---
	// useAuth0 is a hook from the Auth0 library that provides authentication status and methods.
	const {
		isAuthenticated, // boolean: true if the user is logged in.
		user, // object: contains user information like name and picture.
		loginWithRedirect, // function: redirects the user to the Auth0 login page.
		logout, // function: logs the user out.
		isLoading: isAuthLoading, // boolean: true while the Auth0 SDK is initializing.
	} = useAuth0();

	// --- Application State ---
	// useState is a React hook to manage state within a component.
	// Stores the text from the problem description textarea.
	const [problemDescription, setProblemDescription] = useState("");
	// Stores the image file selected by the user.
	const [imageFile, setImageFile] = useState<File | null>(null);
	// Stores a temporary URL for the selected image to show a preview.
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	// Stores the generated repair guide object once it's received from the API.
	const [guide, setGuide] = useState<RepairGuide | null>(null);
	// A boolean flag to indicate when the API call is in progress.
	const [isLoading, setIsLoading] = useState(false);
	// Stores the specific message for the loading spinner (e.g., "Generating image 1 of 3...").
	const [loadingMessage, setLoadingMessage] = useState("");
	// Stores any error messages to display to the user.
	const [error, setError] = useState<string | null>(null);

	// useRef is a React hook to create a reference to a DOM element.
	// This allows us to programmatically interact with the file input, e.g., to clear it.
	const fileInputRef = useRef<HTMLInputElement>(null);

	// --- Event Handlers ---

	/**
	 * Handles the selection of a file from the file input.
	 * It validates the file size and updates the state.
	 */
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file size (e.g., limit to 4MB).
			if (file.size > 4 * 1024 * 1024) {
				setError("Image file is too large. Please select a file under 4MB.");
				return;
			}
			// Store the file object in state.
			setImageFile(file);
			// Create a local URL for the image to display a preview.
			setPreviewUrl(URL.createObjectURL(file));
			// Clear any previous errors.
			setError(null);
		}
	};

	/**
	 * Handles the "Generate Guide" button click.
	 * It validates the form, sets loading states, calls the API service, and handles the response.
	 */
	const handleGenerateGuide = async () => {
		// Basic form validation.
		if (!problemDescription || !imageFile) {
			setError("Please provide a description and an image.");
			return;
		}
		// Reset state for a new request.
		setError(null);
		setIsLoading(true);
		setGuide(null);
		setLoadingMessage("Starting the repair guide generation...");

		try {
			// Call the external service function to handle the API communication.
			// Pass the state update function so the service can update the loading message.
			const result = await generateRepairGuide(
				problemDescription,
				imageFile,
				setLoadingMessage
			);
			// Store the final guide in the state.
			setGuide(result);
		} catch (error: unknown) {
			// If an error occurs, store the error message to display it.
			const message =
				error instanceof Error ? error.message : "An unknown error occurred.";
			setError(message);
		} finally {
			// This block runs whether the try block succeeded or failed.
			// Reset loading state.
			setIsLoading(false);
			setLoadingMessage("");
		}
	};

	/**
	 * Handles the "Start a New Repair" button click.
	 * Resets all relevant state to return the UI to the initial form.
	 */
	const handleReset = () => {
		setProblemDescription("");
		setImageFile(null);
		setPreviewUrl(null);
		setGuide(null);
		setError(null);
		// Clear the file input element so the same file can be selected again if needed.
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// --- Render Functions ---

	/**
	 * Renders the header of the application.
	 * It includes the logo and user information/logout button if authenticated.
	 */
	const renderHeader = () => (
		<header className="w-full max-w-7xl mx-auto flex justify-between items-center p-4 sm:p-6 animate-fade-in-up">
			<div className="flex items-center gap-2">
				<Logo className="h-64 w-auto text-white" />
			</div>
			{isAuthenticated && user && (
				<div className="flex items-center gap-4">
					{user.picture ? (
						<img
							src={user.picture}
							alt={user.name}
							className="h-10 w-10 rounded-full"
						/>
					) : (
						// Fallback for users without a profile picture.
						<span className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
							{user.name?.charAt(0)}
						</span>
					)}
					<button
						// The logout function from Auth0. It redirects the user back to the app's origin after logout.
						onClick={() =>
							logout({ logoutParams: { returnTo: window.location.origin } })
						}
						className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700/80 transition-colors"
					>
						<LogoutIcon className="h-5 w-5" />
						<span className="hidden sm:inline">Log Out</span>
					</button>
				</div>
			)}
		</header>
	);

	// --- Conditional Rendering Logic ---

	// While the Auth0 SDK is loading, show a simple spinner.
	if (isAuthLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				<div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-slate-400"></div>
			</div>
		);
	}

	// If the user is not authenticated, show the login screen.
	if (!isAuthenticated) {
		return (
			<div className="min-h-screen w-full p-4 md:p-8 flex flex-col items-center justify-center text-slate-200">
				<div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-700/80 p-8 rounded-2xl shadow-2xl shadow-black/20 text-center animate-fade-in-up">
					<Logo className="h-80 w-auto text-white mx-auto mb-6" />
					<h1 className="text-3xl font-bold text-white mb-2">
						Welcome to RepairAll
					</h1>
					<p className="text-slate-400 mb-8">
						Your AI-powered assistant for fixing almost anything.
					</p>
					<button
						// The login function from Auth0.
						onClick={() => loginWithRedirect()}
						className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-600/30"
					>
						Log In / Sign Up
					</button>
				</div>
			</div>
		);
	}

	// If the user is authenticated, render the main application.
	return (
		<div className="min-h-screen text-slate-200 font-sans">
			{renderHeader()}
			<main className="container mx-auto p-4 md:p-8">
				{/* If there's no guide and we're not loading, show the input form. */}
				{!guide && !isLoading && (
					<GlassCard className="max-w-2xl mx-auto animate-fade-in-up">
						<div className="text-center mb-8">
							<h2 className="text-3xl font-bold text-white">
								Describe Your Broken Item
							</h2>
							<p className="text-slate-400 mt-2">
								Provide a picture and a description, and we'll do the rest.
							</p>
						</div>
						<div className="space-y-6">
							{/* Problem description textarea */}
							<div>
								<label
									htmlFor="description"
									className="block text-sm font-medium text-slate-300 mb-2"
								>
									Problem Description
								</label>
								<textarea
									id="description"
									rows={4}
									className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder:text-slate-500"
									placeholder="e.g., 'The wooden leg of this chair is cracked near the top.'"
									value={problemDescription}
									onChange={(e) => setProblemDescription(e.target.value)}
								/>
							</div>

							{/* Image upload area */}
							<div>
								<label className="block text-sm font-medium text-slate-300 mb-2">
									Upload an Image
								</label>
								<div
									className="mt-1 flex justify-center p-6 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-colors"
									// Clicking the div triggers a click on the hidden file input.
									onClick={() => fileInputRef.current?.click()}
								>
									<div className="space-y-2 text-center">
										{/* Show the image preview if a file is selected. */}
										{previewUrl ? (
											<img
												src={previewUrl}
												alt="Preview"
												className="mx-auto h-48 w-auto rounded-md object-contain"
											/>
										) : (
											// Otherwise, show the upload prompt.
											<>
												<UploadIcon className="mx-auto h-12 w-12 text-slate-500" />
												<div className="flex text-sm text-slate-400">
													<p>Click to upload a photo</p>
												</div>
												<p className="text-xs text-slate-500">
													PNG, JPG, GIF, WEBP up to 4MB
												</p>
											</>
										)}
									</div>
								</div>
								{/* The actual file input is hidden but controlled via the ref. */}
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleFileChange}
									className="hidden"
									accept="image/png, image/jpeg, image/gif, image/webp"
								/>
							</div>

							{/* Display an error message if the error state is not null. */}
							{error && (
								<div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex items-center gap-3">
									<ErrorIcon className="h-5 w-5 text-red-400" />
									<span>{error}</span>
								</div>
							)}

							{/* The main action button */}
							<button
								onClick={handleGenerateGuide}
								// Disable the button if the form is incomplete or if loading.
								disabled={!problemDescription || !imageFile || isLoading}
								className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-600/30 disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
							>
								<SparklesIcon className="h-5 w-5" />
								Generate Guide
							</button>
						</div>
					</GlassCard>
				)}

				{/* If loading is in progress, show the spinner component. */}
				{isLoading && (
					<div className="animate-fade-in-up">
						<LoadingSpinner message={loadingMessage} />
					</div>
				)}

				{/* If a guide has been successfully generated, display it. */}
				{guide && (
					<div className="max-w-4xl mx-auto animate-fade-in-up">
						<h2 className="text-4xl font-extrabold text-center text-white mb-6">
							Your Repair Guide is Ready!
						</h2>
						{/* Display the safety warning if it exists. */}
						{guide.safetyWarning && (
							<div
								className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-200 p-4 rounded-lg mb-10 flex items-start gap-3"
								role="alert"
							>
								<ErrorIcon className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
								<div>
									<p className="font-bold">Safety First!</p>
									<p>{guide.safetyWarning}</p>
								</div>
							</div>
						)}
						<div className="space-y-12">
							{/* Map over the steps array to render each step of the guide. */}
							{guide.steps.map((step, index) => (
								<div
									key={step.stepNumber}
									// Alternate the layout (image left/right) for better visual flow.
									className={`flex flex-col md:flex-row gap-8 items-center p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/20 transition-transform duration-300 hover:scale-[1.02] animate-fade-in-up ${
										index % 2 === 1 ? "md:flex-row-reverse" : ""
									}`}
									// Stagger the animation of each step for a nice cascade effect.
									style={{ animationDelay: `${index * 150}ms` }}
								>
									<div className="md:w-1/2 w-full">
										<img
											src={step.imageUrl}
											alt={`Step ${step.stepNumber}`}
											className="w-full h-auto rounded-xl object-cover aspect-[4/3] bg-slate-800"
										/>
									</div>
									<div className="md:w-1/2">
										<h3 className="text-2xl font-bold text-indigo-400 mb-3">
											Step {step.stepNumber}
										</h3>
										<p className="text-lg text-slate-300 leading-relaxed">
											{step.description}
										</p>
									</div>
								</div>
							))}
						</div>
						{/* Button to reset the app and start a new repair. */}
						<div className="text-center mt-12">
							<button
								onClick={handleReset}
								className="px-8 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors"
							>
								Start a New Repair
							</button>
						</div>
					</div>
				)}
			</main>
		</div>
	);
};

export default App;
