// Test configuration for agent outputs
// Set individual agent test modes to control which agents use test data vs real API calls

export type AgentId = 'idea-enhancer' | 'wireframe-generator' | 'code-generator' | 'file-system' | 'preview-setup';

export const TEST_CONFIG = {
    // Individual agent test mode controls
    AGENT_TEST_MODES: {
        'idea-enhancer': true,        // Use test data for idea enhancement
        'wireframe-generator': true,  // Use test data for wireframes
        'code-generator': false,      // Use real API for code generation
        'file-system': false,         // Use real API for file organization
        'preview-setup': false        // Use real API for preview setup
    } as Record<AgentId, boolean>,

    // Global fallback (deprecated - use AGENT_TEST_MODES instead)
    USE_TEST_DATA: false,

    // Hardcoded agent outputs for testing
    AGENT_OUTPUTS: {
        'idea-enhancer': {
            title: "HackFlow: Professional Hackathon Management Platform",
            description: "A comprehensive hackathon management platform that streamlines event organization, participant registration, team formation, judging, and real-time event tracking for both organizers and participants.",
            enhancedDescription: "HackFlow transforms hackathon management from chaotic spreadsheets to a seamless, professional experience. Organizers get powerful tools for event setup, participant management, and real-time monitoring, while participants enjoy smooth registration, team discovery, and project submission workflows. The platform creates an engaging atmosphere that keeps energy high throughout the event.",
            features: [
                "Event creation and management dashboard",
                "Participant registration with skill-based matching",
                "Team formation and collaboration tools",
                "Real-time event timeline and announcements",
                "Project submission and showcase platform",
                "Judging interface with scoring rubrics",
                "Live leaderboards and progress tracking",
                "Mentor assignment and communication system",
                "Resource sharing and documentation hub",
                "Analytics and post-event reporting",
                "Mobile-responsive design for on-the-go access"
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
                    asA: "hackathon organizer",
                    IWant: "to set up my event quickly with all necessary details",
                    SoThat: "participants have clear information and can register easily"
                },
                {
                    asA: "participant",
                    IWant: "to find teammates with complementary skills",
                    SoThat: "I can form a strong team for the hackathon"
                },
                {
                    asA: "judge",
                    IWant: "to evaluate projects efficiently with clear criteria",
                    SoThat: "I can provide fair and consistent scoring"
                },
                {
                    asA: "mentor",
                    IWant: "to connect with teams that need my expertise",
                    SoThat: "I can provide valuable guidance during the event"
                },
                {
                    asA: "participant",
                    IWant: "to submit my project and showcase it effectively",
                    SoThat: "judges and other participants can understand my work"
                }
            ],
            wireframeRequirements: [
                "Landing page with event overview and registration CTA",
                "Organizer dashboard with event management tools",
                "Participant registration flow with skill selection",
                "Team formation interface with matching suggestions",
                "Real-time event timeline with updates and announcements",
                "Project submission portal with media upload",
                "Judging interface with scoring rubrics and comments",
                "Live leaderboard and results display",
                "Mobile-optimized views for all key features"
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
            userFlow: "graph TD\n A[Landing Page] --> B{User Type?}\n B -->|Organizer| C[Create Event]\n B -->|Participant| D[Browse Events]\n B -->|Judge| E[Judge Dashboard]\n C --> F[Event Management]\n D --> G[Register for Event]\n G --> H[Team Formation]\n H --> I[Project Development]\n I --> J[Submit Project]\n E --> K[Evaluate Projects]\n F --> L[Monitor Event]\n J --> M[Results & Awards]\n K --> M",

            systemArchitecture: "graph TD\n A[Web App - Next.js] --> B[API Gateway]\n B --> C[Authentication Service]\n B --> D[Event Management Service]\n B --> E[User Management Service]\n B --> F[Team Formation Service]\n B --> G[Judging Service]\n C --> H[Supabase Auth]\n D --> I[Supabase Database]\n E --> I\n F --> I\n G --> I\n A --> J[Real-time Updates]\n J --> K[WebSocket Server]",

            databaseSchema: "erDiagram\n EVENTS ||--o{ PARTICIPANTS : registers\n EVENTS ||--o{ TEAMS : participates\n EVENTS ||--o{ JUDGES : evaluates\n PARTICIPANTS ||--o{ TEAMS : joins\n TEAMS ||--o{ PROJECTS : creates\n PROJECTS ||--o{ SUBMISSIONS : has\n JUDGES ||--o{ SCORES : gives\n EVENTS {\n UUID event_id PK\n string title\n string description\n datetime start_date\n datetime end_date\n }\n PARTICIPANTS {\n UUID participant_id PK\n UUID user_id FK\n UUID event_id FK\n array skills\n string bio\n }\n TEAMS {\n UUID team_id PK\n UUID event_id FK\n string name\n array members\n }\n PROJECTS {\n UUID project_id PK\n UUID team_id FK\n string title\n string description\n string demo_url\n }",

            componentHierarchy: "graph TD\n A[HackFlow App] --> B[Authentication]\n A --> C[Event Management]\n A --> D[Participant Portal]\n A --> E[Team Formation]\n A --> F[Project Submission]\n A --> G[Judging System]\n A --> H[Real-time Updates]\n B --> B1[Login/Register]\n B --> B2[Profile Management]\n C --> C1[Event Creation]\n C --> C2[Event Dashboard]\n D --> D1[Event Registration]\n D --> D2[Participant Directory]\n E --> E1[Team Matching]\n E --> E2[Team Chat]\n F --> F1[Project Upload]\n F --> F2[Showcase Gallery]\n G --> G1[Scoring Interface]\n G --> G2[Results Display]\n H --> H1[Live Timeline]\n H --> H2[Notifications]",

            description: "These wireframes show a comprehensive hackathon management platform with:\n1. User Flow: Clear paths for organizers, participants, and judges\n2. System Architecture: Modern web stack with real-time capabilities\n3. Database Schema: Relationships between events, users, teams, and projects\n4. Component Hierarchy: Modular structure for scalable development"
        }
    },

    // Streaming simulation settings
    STREAMING: {
        WORDS_PER_CHUNK: 3, // Number of words to send per chunk
        CHUNK_DELAY: 150,   // Delay between chunks in milliseconds
    }
}; 