# Daylight App Setup

This project displays daylight hours for cities in Finland. The project contains a backend (PHP API) and frontend (React + Vite + TailwindCSS). The folder structure is:

daylight-app/
├── backend/    # PHP API
└── frontend/   # React frontend

Prerequisites: PHP 7.4+ with cURL enabled, Node.js 18+ and npm or yarn. To run the backend, navigate to the backend folder with `cd daylight-app/backend` and start the PHP built-in server using `php -S localhost:8000`.

To run the frontend, navigate to the frontend folder with `cd daylight-app/frontend`, install dependencies using `npm install` or `yarn`, and start the dev server using `npm run dev` or `yarn dev`. Open the frontend in a browser at the URL shown in the terminal (usually `http://localhost:5173`). The frontend is configured to proxy API requests to the backend using Vite: requests starting with `/api` are forwarded to `http://localhost:8000` and the `/api` prefix is stripped automatically.

If you need to change ports, replace `8000` in the PHP command for the backend. The Vite frontend will auto-select an available port if 5173 is busy, or you can configure a custom port in `vite.config.js`. If the API returns “City not found,” make sure the requested city is in Finland. For PHP errors, confirm `display_errors` is enabled and cURL is installed. Frontend connection issues may be caused by incorrect proxy settings in `vite.config.js`.
