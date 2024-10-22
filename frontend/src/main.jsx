import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from './Context/SocketContext.jsx';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
				<QueryClientProvider client={queryClient}>
			<SocketProvider>
					<App />
			</SocketProvider>
				</QueryClientProvider>
		</BrowserRouter>
	</StrictMode>
);
