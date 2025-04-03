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

1. Use the following command to start the application:
   ```bash
   python start_rezguru.py
   ```
   
   This script will:
   - Clone the RezGuruAI repository if not already present
   - Configure environment variables
   - Start the Node.js server on port 5000
   
2. Wait for the server to initialize (this may take a few moments)
3. Access the application at http://localhost:5000

### User Interface

- Login with the default credentials:
  - Username: `lazarus`
  - Password: `realestate123`
- Use the sidebar navigation to access different features
- The dashboard provides an overview of key metrics and activities

### Key Functionality

- **Assistant**: AI-powered assistant to answer questions and provide recommendations
- **Dashboard**: Overview of your real estate business metrics
- **Leads**: Manage potential clients with scoring and status tracking
- **Documents**: Generate and manage property-related documents
- **Automations**: Create automated workflows for repetitive tasks
- **Scraping**: Set up web scraping jobs to find property listings

## Technologies Used

- Frontend: React, TypeScript, TailwindCSS
- Backend: Express.js, Node.js
- Database: PostgreSQL
- AI Integration: Azure OpenAI

## Environment Variables

The application uses the following environment variables:

- `DATABASE_URL`: PostgreSQL database connection string
- `AZURE_OPENAI_API_KEY`: API key for Azure OpenAI service
- `AZURE_OPENAI_ENDPOINT`: Endpoint URL for Azure OpenAI API (default: https://models.inference.ai.azure.com)
- `SESSION_SECRET`: Secret for session management

These variables are automatically set up by the `start_rezguru.py` script using values from your environment.

### Database Setup

The application uses a PostgreSQL database. When first started, it will:

1. Connect to the database specified in the `DATABASE_URL` environment variable
2. Create the necessary tables and schema if they don't exist
3. Populate some initial data for demonstration purposes

## Troubleshooting

If you encounter issues:

1. Check the console for error messages
2. Verify that all environment variables are set correctly
3. Ensure the PostgreSQL database is running and accessible
4. Make sure you have a valid Azure OpenAI API key