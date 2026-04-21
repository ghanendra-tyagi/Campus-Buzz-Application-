<<<<<<< HEAD
# Campus-Buzz-Application-
=======
# 🎓 Campus Buzz - Indian College Event Management System

A modern, full-stack event management platform designed specifically for Indian colleges and universities.

## 📁 Project Structure

```
Campus Buzz/
├── frontend/                  # Next.js Frontend Application
│   ├── app/                  # Next.js 15 App Router
│   │   ├── (auth)/          # Authentication pages (login, signup)
│   │   ├── admin/           # Admin dashboard
│   │   ├── events/          # Event pages
│   │   ├── profile/         # User profile
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React Components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── event-card.tsx  # Event display component
│   │   ├── navbar.tsx      # Navigation component
│   │   └── ...             # Other components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configurations
│   │   ├── api-client.ts   # API communication layer
│   │   ├── store.ts        # Zustand state management
│   │   └── utils.ts        # Helper functions
│   ├── public/             # Static assets (images, icons)
│   ├── styles/             # Global styles
│   └── package.json        # Frontend dependencies
│
├── backend/                 # Node.js/Express Backend API
│   ├── config/             # Configuration files
│   │   ├── database.js     # PostgreSQL connection
│   │   └── jwt.js          # JWT configuration
│   ├── controllers/        # Business logic
│   │   ├── authController.js          # Authentication logic
│   │   ├── eventController.js         # Event management
│   │   ├── registrationController.js  # Event registrations
│   │   └── adminController.js         # Admin operations
│   ├── routes/             # API routes
│   │   ├── authRoutes.js   # /api/auth routes
│   │   ├── eventRoutes.js  # /api/events routes
│   │   ├── userRoutes.js   # /api/user routes
│   │   └── adminRoutes.js  # /api/admin routes
│   ├── middlewares/        # Express middlewares
│   │   └── auth.js         # JWT authentication
│   ├── scripts/            # Database initialization scripts
│   ├── server.js           # Main application entry point
│   └── package.json        # Backend dependencies
│
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🏗️ Architecture

### Frontend (Next.js 15 + TypeScript)
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + Shadcn/ui
- **State Management:** Zustand
- **Icons:** Lucide React

### Backend (Node.js + Express)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Architecture:** MVC Pattern (Model-View-Controller)

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **pnpm**

### Installation

#### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example if provided)
# Configure the following variables:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_buzz
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_jwt_secret_here
PORT=5000

# Initialize database (create tables and sample data)
npm run init-db

# Start backend server
npm run dev
# Server will run on http://localhost:5000
```

#### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend will run on http://localhost:3000
```

### Running the Complete System
You need **two terminal windows**:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Then open your browser to `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (Admin only)
- `POST /api/events/:id/register` - Register for event
- `POST /api/events/:id/feedback` - Submit feedback

### User
- `GET /api/user/registrations` - Get user's registrations

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/events/:id/registrations` - Event registrations

## 🎨 Features

### For Students
- Browse college events by category
- Search events by name or description
- Register for events with QR code tickets
- Track event registrations
- Submit event feedback and ratings
- Mobile-responsive design

### For Admins
- Create and manage events
- View registration statistics
- Track event revenue
- Export attendee lists
- Dashboard analytics

### Event Categories
- 🖥️ Technology (Hackathons, Tech Talks)
- 🎵 Music (Concerts, Cultural Events)
- 🎨 Arts (Exhibitions, Performances)
- ⚽ Sports (Tournaments, Competitions)

## 💰 Pricing (Indian Rupees)
All pricing is in ₹ (Indian Rupees), designed for college students:
- Tech Events: ₹199-₹299
- Cultural Events: ₹149-₹199
- Workshops: ₹99-₹149
- Sports Events: Often Free
- Gaming Tournaments: ₹49

## 🔐 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Student/Admin)
- Protected API routes
- CORS configuration

## 🛠️ Development

### Backend Structure (MVC Pattern)
- **Config:** Database and JWT configuration
- **Controllers:** Business logic for each feature
- **Routes:** API endpoint definitions
- **Middlewares:** Authentication and authorization

### Frontend Structure
- **App Router:** Next.js 15 file-based routing
- **Components:** Reusable UI components
- **Hooks:** Custom React hooks for state and effects
- **Lib:** Utilities, API client, and store configuration

## 📦 Key Dependencies

### Frontend
- Next.js 15.2.4
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zustand (State Management)
- Radix UI Components

### Backend
- Express 4.18
- PostgreSQL (pg 8.11)
- JWT (jsonwebtoken 9.0)
- bcryptjs 2.4
- dotenv 16.3

## 🤝 Contributing
1. Follow the existing code structure
2. Use meaningful commit messages
3. Test thoroughly before committing
4. Update documentation as needed

## 📝 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_buzz
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
PORT=5000
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify credentials in .env file
- Check if database exists

### Port Conflicts
- Backend uses port 5000 (configurable)
- Frontend uses port 3000 (configurable)
- Change ports in respective config files if needed




>>>>>>> 4c030f2 (name)
