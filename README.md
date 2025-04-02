
# RezGuru AI - Real Estate Automation Platform

RezGuru AI is a powerful real estate automation platform that combines AI-driven analytics, lead management, document generation, and workflow automation to streamline real estate operations.

## Features

### 🎯 Lead Management
- AI-powered lead scoring and analysis
- Visual Kanban board for lead pipeline management
- Automated lead nurturing workflows
- Lead source analytics and performance tracking

### 📊 Analytics Dashboard
- Real-time property market insights
- Lead conversion metrics
- Revenue and ROI tracking
- Property type distribution analysis
- Custom report generation

### 🤖 AI Assistant
- Deal analysis and evaluation
- Property valuation assistance
- Automated document creation
- Market trend analysis

### 📄 Document Management
- Automated contract generation
- Template management system
- Digital document storage
- Smart form filling

### 🔄 Automation Workflows
- Custom workflow creation
- Lead nurturing sequences
- Automated follow-ups
- Task scheduling

### 🌐 Web Scraping
- Automated lead generation
- Property listing scraping
- Market data collection
- Scheduled scraping jobs

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Azure OpenAI
- **Authentication**: Passport.js

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/          # Frontend React application
├── server/          # Backend Express server
├── shared/          # Shared types and schemas
└── package.json     # Project configuration
```

## Environment Variables

Required environment variables:
- `AZURE_OPENAI_API_KEY`: Azure OpenAI API key
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session management

## API Routes

- `/api/leads` - Lead management endpoints
- `/api/analytics` - Analytics data endpoints
- `/api/documents` - Document management
- `/api/workflows` - Automation workflow endpoints
- `/api/scraping-jobs` - Web scraping job management

## Contributing

To contribute to RezGuru AI:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License
