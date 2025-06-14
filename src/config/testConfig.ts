// Test configuration for agent outputs
// Set USE_TEST_DATA to true to use hardcoded responses instead of API calls
export const TEST_CONFIG = {
    USE_TEST_DATA: true, // Set to false to use real API calls

    // Hardcoded agent outputs for testing
    AGENT_OUTPUTS: {
        'idea-enhancer': {
            title: "FitConnect: Social Fitness Tracking App",
            description: "A comprehensive fitness tracking application that allows users to monitor their workouts, set personal goals, and connect with friends to stay motivated through social features such as sharing achievements, challenges, and progress updates.",
            enhancedDescription: "FitConnect empowers users to take control of their health and fitness journey by providing robust workout tracking, personalized goal setting, and an engaging social platform. Users can log various types of exercises, view detailed analytics of their progress, participate in fitness challenges, and share milestones with their community. The app fosters motivation and accountability through social interactions, leaderboards, and community groups, making fitness a collaborative and enjoyable experience.",
            features: [
                "User registration and profile management",
                "Workout logging for various exercise types (cardio, strength, flexibility, etc.)",
                "Personal goal setting and progress tracking",
                "Social feed to share updates, achievements, and photos",
                "Friend system to connect and follow other users",
                "Challenges and competitions to motivate users",
                "Leaderboards based on activity and achievements",
                "Notifications and reminders for workouts and milestones",
                "Integration with wearable devices and health APIs",
                "Privacy controls for shared content",
                "Analytics dashboard for detailed progress insights"
            ],
            techStack: [
                "Frontend: React Native",
                "Backend: Node.js with Express",
                "Database: PostgreSQL",
                "Authentication: Firebase Authentication or OAuth 2.0",
                "Real-time features: WebSocket or Firebase Realtime Database",
                "Third-party integrations: Fitbit API, Apple HealthKit, Google Fit",
                "Hosting: AWS or Azure"
            ],
            userStories: [
                {
                    asA: "new user",
                    IWant: "to create an account and set up my profile",
                    SoThat: "I can personalize my experience and start tracking workouts"
                },
                {
                    asA: "user",
                    IWant: "to log my workouts easily",
                    SoThat: "I can monitor my activity and progress over time"
                },
                {
                    asA: "user",
                    IWant: "to set fitness goals",
                    SoThat: "I can stay motivated and measure my achievements"
                },
                {
                    asA: "user",
                    IWant: "to connect with friends",
                    SoThat: "I can share my progress and stay motivated through social support"
                },
                {
                    asA: "user",
                    IWant: "to participate in challenges",
                    SoThat: "I can compete and push myself further with others"
                },
                {
                    asA: "user",
                    IWant: "to view analytics of my workouts",
                    SoThat: "I can understand my performance trends and improve"
                }
            ],
            wireframeRequirements: [
                "Login/Register screen with social login options",
                "User profile page with editable details and stats",
                "Home feed displaying recent activity, updates, and shared content",
                "Workout logging screen with options for different exercise types",
                "Goals setting interface with target metrics",
                "Friends list and search functionality",
                "Challenges page with ongoing and upcoming challenges",
                "Analytics dashboard with charts and summaries",
                "Settings page for privacy, notifications, and app preferences"
            ],
            databaseSchema: {
                Users: {
                    userId: "UUID",
                    username: "string",
                    email: "string",
                    passwordHash: "string",
                    profilePicture: "string",
                    bio: "string",
                    createdAt: "Date",
                    updatedAt: "Date"
                },
                Workouts: {
                    workoutId: "UUID",
                    userId: "UUID",
                    type: "string",
                    duration: "number",
                    caloriesBurned: "number",
                    date: "Date",
                    details: "object"
                },
                Goals: {
                    goalId: "UUID",
                    userId: "UUID",
                    type: "string",
                    target: "number",
                    currentProgress: "number",
                    deadline: "Date",
                    status: "string"
                },
                Posts: {
                    postId: "UUID",
                    userId: "UUID",
                    content: "string",
                    mediaURL: "string",
                    timestamp: "Date",
                    privacy: "string"
                },
                Friends: {
                    userId: "UUID",
                    friendId: "UUID",
                    status: "string",
                    createdAt: "Date"
                },
                Challenges: {
                    challengeId: "UUID",
                    title: "string",
                    description: "string",
                    participants: ["UUID"],
                    startDate: "Date",
                    endDate: "Date",
                    status: "string"
                },
                Leaderboards: {
                    leaderboardId: "UUID",
                    type: "string",
                    entries: "object"
                }
            },
            apiEndpoints: [
                {
                    method: "POST",
                    path: "/api/auth/register",
                    description: "Register a new user"
                },
                {
                    method: "POST",
                    path: "/api/auth/login",
                    description: "Authenticate user and obtain token"
                },
                {
                    method: "GET",
                    path: "/api/users/{userId}",
                    description: "Fetch user profile"
                },
                {
                    method: "POST",
                    path: "/api/workouts",
                    description: "Log a new workout"
                },
                {
                    method: "GET",
                    path: "/api/workouts/{workoutId}",
                    description: "Retrieve workout details"
                },
                {
                    method: "POST",
                    path: "/api/goals",
                    description: "Create or update fitness goals"
                },
                {
                    method: "POST",
                    path: "/api/posts",
                    description: "Create a new social post"
                },
                {
                    method: "GET",
                    path: "/api/friends",
                    description: "Get list of friends"
                },
                {
                    method: "GET",
                    path: "/api/challenges",
                    description: "Retrieve available challenges"
                },
                {
                    method: "GET",
                    path: "/api/leaderboards",
                    description: "Fetch leaderboard data"
                }
            ],
            deploymentStrategy: "Adopt a cloud-native approach using AWS or Azure for scalable hosting. Implement CI/CD pipelines with GitHub Actions or Jenkins for continuous integration and deployment. Utilize Docker containers for environment consistency. Use managed databases like Amazon RDS for PostgreSQL. Integrate with monitoring tools such as AWS CloudWatch or Azure Monitor for performance tracking. Prioritize security best practices including SSL/TLS, OAuth 2.0, and regular security audits. Plan for phased rollouts starting with core features, followed by social and challenge functionalities, ensuring user feedback guides iterative improvements."
        },

        'wireframe-generator': {
            userFlow: "graph TD\n A[App Start] --> B{Authenticated?}\n B -->|No| C[Login/Register]\n C --> D[Create Profile]\n B -->|Yes| E[Home Dashboard]\n D --> E\n E --> F[Log Workout]\n E --> G[Set Goals]\n E --> H[View Social Feed]\n F --> I[Track Progress]\n G --> I\n H --> J[Connect with Friends]\n H --> K[Join Challenges]\n I --> L[View Analytics]\n J --> M[Send/Accept Requests]\n K --> N[Participate in Challenge]\n L --> O[Share Achievements]",

            systemArchitecture: "graph TD\n A[Mobile App - React Native] --> B[API Gateway]\n B --> C[Authentication Service]\n B --> D[User Service]\n B --> E[Workout Tracking Service]\n B --> F[Social Service]\n B --> G[Challenge Service]\n C --> H[Firebase/OAuth]\n D --> I[PostgreSQL Database]\n E --> I\n F --> I\n G --> I\n A --> J[Wearable Device APIs]\n A --> K[Health APIs]\n L[WebSocket Server] --> A",

            databaseSchema: "erDiagram\n USERS ||--o{ WORKOUTS : logs\n USERS ||--o{ GOALS : sets\n USERS ||--o{ POSTS : creates\n USERS ||--o{ FRIENDS : connects\n USERS ||--o{ CHALLENGES : participates\n USERS {\n UUID user_id PK\n string username\n string email\n string passwordHash\n }\n WORKOUTS {\n UUID workout_id PK\n UUID user_id FK\n string type\n int duration\n int caloriesBurned\n }\n GOALS {\n UUID goal_id PK\n UUID user_id FK\n string type\n float target\n float currentProgress\n }\n POSTS {\n UUID post_id PK\n UUID user_id FK\n string content\n string mediaURL\n }",

            componentHierarchy: "graph TD\n A[FitConnect App] --> B[Authentication]\n A --> C[User Profile]\n A --> D[Workout Tracking]\n A --> E[Social Features]\n A --> F[Challenges]\n A --> G[Analytics]\n B --> B1[Login]\n B --> B2[Registration]\n C --> C1[Profile Management]\n C --> C2[Personal Stats]\n D --> D1[Exercise Logging]\n D --> D2[Workout Types]\n E --> E1[Social Feed]\n E --> E2[Friend Connections]\n E --> E3[Post Sharing]\n F --> F1[Active Challenges]\n F --> F2[Challenge Creation]\n G --> G1[Progress Charts]\n G --> G2[Performance Metrics]",

            description: "These Mermaid diagrams provide visual representations of:\n1. User Flow: Shows the typical user journey through the app\n2. System Architecture: Illustrates the technical components and their interactions\n3. Database Schema: Displays the relationships between different data entities\n4. Component Hierarchy: Breaks down the app's main components and subcomponents"
        }
    },

    // Streaming simulation settings
    STREAMING: {
        WORDS_PER_CHUNK: 2, // Number of words to send per chunk (reduced for more visible streaming)
        CHUNK_DELAY: 200,   // Delay between chunks in milliseconds (increased for more visible effect)
    }
}; 