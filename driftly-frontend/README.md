# Driftly Frontend Application

This is the frontend application for Driftly, a tool for setting up email nurture flows simply. The frontend is built with React, TypeScript, and Tailwind CSS, and connects to the Driftly backend API.

## Features

- User authentication (login, registration, password reset)
- Dashboard with flow listing and statistics
- Flow builder for creating and editing email nurture sequences
- Contact management for adding and tracking recipients
- Template library with pre-built email sequences
- Analytics dashboard with performance metrics
- Settings management for account and API configuration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Driftly backend API running

### Installation

1. Clone the repository
2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```
npm start
```

## Project Structure

- `/src/components`: Reusable UI components
- `/src/contexts`: React context providers (auth, etc.)
- `/src/hooks`: Custom React hooks
- `/src/pages`: Page components for each route
- `/src/services`: API service functions
- `/src/utils`: Utility functions
- `/src/styles`: Global styles and Tailwind configuration

## Backend Integration

The frontend connects to the Driftly backend API for all data operations. The API endpoints are defined in `/src/services/api.ts`.

## Deployment

To build the application for production:

```
npm run build
```

The build artifacts will be stored in the `build/` directory.

## License

This project is proprietary and confidential.
