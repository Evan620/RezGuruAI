# RezGuruAI Application

RezGuruAI is a comprehensive real estate automation platform with AI-powered features for lead management, document generation, analytics, and web scraping.

## Features

- **Lead Management**: Track and manage potential clients from initial contact to closing
- **Document Generation**: Create professional real estate documents using AI
- **Analytics Dashboard**: Get insights on leads, properties, and revenue
- **Web Scraping**: Automate data collection from property listing websites
- **Workflow Automation**: Set up custom workflows for common real estate tasks

## Getting Started

### Starting the Application

The application is configured to run on port 5000. To start it:

1. Click the "Run" button in the Replit interface
2. Wait for the server to initialize (this may take a few moments)
3. Access the application at http://localhost:5000

### User Interface

- Login with the default credentials or create a new account
- Use the sidebar navigation to access different features
- The dashboard provides an overview of key metrics and activities

## Technologies Used

- Frontend: React, TypeScript, TailwindCSS
- Backend: Express.js, Node.js
- Database: PostgreSQL
- AI Integration: Azure OpenAI

## Environment Variables

The application uses the following environment variables:

- `DATABASE_URL`: PostgreSQL database connection string
- `AZURE_OPENAI_API_KEY`: API key for Azure OpenAI service
- `AZURE_OPENAI_ENDPOINT`: Endpoint URL for Azure OpenAI API
- `SESSION_SECRET`: Secret for session management

These variables are automatically set during the application startup.