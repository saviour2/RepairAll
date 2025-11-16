// Import necessary libraries from React for building the user interface.
import React from "react";
import ReactDOM from "react-dom/client";
// Import the Auth0Provider to wrap our application and provide authentication context.
import { Auth0Provider } from "@auth0/auth0-react";
// Import the main App component, which is the root of our application's UI.
import App from "./App";

// Find the root HTML element in index.html where our React app will be mounted.
const rootElement = document.getElementById("root");
// If the root element doesn't exist, throw an error because the app can't be rendered.
if (!rootElement) {
	throw new Error("Could not find root element to mount to");
}

// Read Auth0 configuration from Vite environment variables so each developer can supply their own tenant.
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

// Create a React root, which is the modern way to render a React application.
const root = ReactDOM.createRoot(rootElement);

// Check if the Auth0 credentials are provided.
if (!auth0Domain || !auth0ClientId) {
	// If credentials are NOT provided, render a helpful error message instead of the app.
	// This guides the developer on how to configure the application.
	root.render(
		<React.StrictMode>
			<div className="min-h-screen w-full p-4 md:p-8 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
				<div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center max-w-2xl">
					<h1 className="text-3xl font-bold text-red-600 mb-4">
						Configuration Requise
					</h1>
					<p className="text-slate-700 mb-4">
						Pour activer l'authentification, les variables d'environnement{" "}
						<code className="bg-slate-200 text-sm font-mono p-1 rounded">
							VITE_AUTH0_DOMAIN
						</code>{" "}
						et{" "}
						<code className="bg-slate-200 text-sm font-mono p-1 rounded">
							VITE_AUTH0_CLIENT_ID
						</code>{" "}
						doivent être définies.
					</p>
					<p className="text-slate-600">
						Veuillez créer un compte gratuit sur{" "}
						<a
							href="https://auth0.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-indigo-600 hover:underline font-semibold"
						>
							Auth0
						</a>
						, configurer une nouvelle application, et ajouter les clés
						correspondantes à cet environnement pour continuer.
					</p>
				</div>
			</div>
		</React.StrictMode>
	);
} else {
	// If credentials ARE provided, render the main application.
	root.render(
		// StrictMode is a tool for highlighting potential problems in an application. It helps write better React code.
		<React.StrictMode>
			{/* Auth0Provider wraps the App component, making authentication methods and user state available to all child components. */}
			<Auth0Provider
				// The domain of your Auth0 tenant.
				domain={auth0Domain}
				// The client ID of your Auth0 application.
				clientId={auth0ClientId}
				// Configuration for the authorization process.
				authorizationParams={{
					// The URL where Auth0 will redirect the user after they log in.
					// `window.location.origin` refers to the base URL of the application (e.g., 'http://localhost:3000').
					redirect_uri: window.location.origin,
				}}
			>
				{/* Render the main App component. */}
				<App />
			</Auth0Provider>
		</React.StrictMode>
	);
}
