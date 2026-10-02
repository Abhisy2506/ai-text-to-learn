# Folders and files structure of the project

text-to-learn/
├── .gitignore
├── README.md
├── server/                 # Express + Node.js backend (Render deployment)
│   ├── config/             # DB connection (db.js)
│   ├── controllers/        # Request handlers (courseController.js, lessonController.js)
│   ├── middlewares/        # Auth0 token validation, error handlers
│   ├── models/             # Mongoose schemas (Course.js, Module.js, Lesson.js)
│   ├── routes/             # Express routers (api.js, courseRoutes.js)
│   ├── services/           # Gemini API & YouTube integrations
│   ├── .env
│   ├── package.json
│   └── server.js           # Main Express entry point
└── client
        /src/
            ├── layouts/
            │   └── AppLayout.jsx          # Main layout wrapping Sidebar, Header, Content, and IB
            ├── components/
            │   ├── Sidebar/
            │   │   ├── Sidebar.jsx        # Container for the left drawer
            │   │   ├── NewCourseBtn.jsx   # Resets stage to prompt a new course
            │   │   └── CourseHistory.jsx  # List of previous course titles (active highlighted)
            │   ├── Header/
            │   │   ├── Header.jsx         # Top bar with collapse toggle and user profile
            │   │   └── UserMenu.jsx       # Auth0 avatar + dropdown
            │   ├── Stage/
            │   │   ├── EmptyState.jsx     # Hero section shown before generating
            │   │   └── LessonStage.jsx    # Displays lesson syllabus and dynamic content blocks
            │   └── PromptBar/
            │       └── ChatInput.jsx      # Fixed floating bottom input with submit button
            ├── .env
            ├── package.json
            └── vite.config.js



## 🔌 API Reference

Base URL: `http://localhost:5000` (Local) / `https://your-backend.onrender.com` (Production)

### Quick Summary

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | No | Server health check and uptime ping target |
| `POST` | `/api/users/sync` | Yes | Synchronizes Auth0 user profile with MongoDB |
| `GET` | `/api/users/me` | Yes | Fetches current user profile and saved courses |
| `POST` | `/api/courses/generate` | Yes | Generates syllabus & modules from a topic prompt |
| `GET` | `/api/courses` | Yes | Retrieves all courses created by the user |
| `GET` | `/api/courses/:courseId` | No | Fetches a course with its populated module outline |
| `DELETE` | `/api/courses/:courseId` | Yes | Deletes a course and its associated content |
| `GET` | `/api/lessons/:lessonId` | No | Fetches full lesson content blocks and MCQs |
| `POST` | `/api/lessons/:lessonId/enrich` | Yes | Generates detailed lesson blocks via Gemini AI |
| `GET` | `/api/youtube` | No | Fetches relevant YouTube video recommendations |
| `POST` | `/api/audio/hinglish` | No | Translates lesson text to Hinglish and returns TTS audio |

---