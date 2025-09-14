# Memobit Medical Tracking
A collection of React-based management tools for organizing personal content across multiple domains.

### Overview
Manage reading lists with authors, progress tracking, and notes

### Architecture
Built using a composition-over-configuration approach where each domain has its own focused application while sharing foundational components and utilities.

### Tech Stack

- React 18 with TypeScript
- SCSS for styling
- Custom hooks for state management
- Local storage for persistent filters/sorting
- PHP backend with MySQL database

### Key Features

- Dark mode interface
- Responsive design (mobile/desktop)
- Advanced filtering and sorting with persistence
- Modal-based forms and detail views
- Image handling with fallbacks
- Toast notifications
- Pagination

### Project Structure
```
src/
├── components/
│   ├── shared/           # Reusable UI components
│   ├── [app-name]/       # App-specific components
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
├── types/                # TypeScript interfaces
└── styles/               # SCSS stylesheets
```

## Setup

### Install dependencies:
```npm install```

- Configure database connection in PHP backend
- Start development server: ```num run start```
- Build solution: ```num run build```


### Database
Each application uses its own database tables with normalized relationships. The PHP scripts handle data fetching and updates.

### Development
The project uses a proxy setup for local development to avoid CORS issues. Filter and sorting preferences are automatically saved to localStorage with app-specific namespacing.
