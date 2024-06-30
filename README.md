YouTube Transcribe and Translate Web App

This project is a web application that allows users to transcribe and optionally translate YouTube videos into English. It includes a frontend built with React and a backend implemented in Node.js and Express.js. Payments for translation services are handled using the PayPal API. The application is deployed using GitHub Pages for the frontend and Render for the backend services.
Features

    YouTube URL Input: Users can enter a YouTube video URL to transcribe its audio content.
    Transcription: Utilizes YouTube's API to fetch the audio stream of the video and transcribe it using a custom backend service.
    Translation: Optionally translates the transcription to English using LibreTranslate API upon user request.
    Payment Integration: Allows users to pay for translation services using PayPal API.
    Deployment: Frontend deployed on GitHub Pages and backend services dockerized and deployed on Render.

Technologies Used

    Frontend: React, JavaScript, HTML/CSS
    Backend: Node.js, Express.js
    APIs: YouTube Data API, PayPal API, LibreTranslate API
    Deployment: GitHub Pages, Render

Getting Started

To run this project locally, follow these steps:

    Clone the repository:

    bash

git clone https://github.com/your-username/your-repository.git
cd your-repository

Install dependencies for frontend and backend:

bash

cd client
npm install
cd ../server
npm install

Set up environment variables:

    Create a .env file in both client and server directories.
    Add necessary environment variables (e.g., API keys).

Start the frontend and backend servers:

bash

    # In client directory
    npm start

    # In server directory
    npm start

    Open your browser and navigate to http://localhost:3000 to view the application.
