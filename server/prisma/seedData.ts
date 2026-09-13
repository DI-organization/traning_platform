import { ResourceType, TaskDifficulty, TaskPriority, TaskType } from "@prisma/client";

export interface SeedTask {
  code: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  points: number;
  estimatedHours: number;
  instructions: string;
  acceptanceCriteria: string[];
  isWeeklyProject?: boolean;
}

export interface SeedResource {
  title: string;
  description: string;
  url: string;
  type: ResourceType;
  isRequired: boolean;
  estimatedMinutes: number;
  topic?: string;
}

export interface SeedWeek {
  weekNumber: number;
  title: string;
  description: string;
  objectives: string[];
  topics: string[];
  resources: SeedResource[];
  tasks: SeedTask[];
  researchQuestions: string[];
  weeklyProjectTitle?: string;
  weeklyProjectDescription?: string;
  submissionRequirements: string[];
}

export interface SeedPhase {
  phaseNumber: number;
  title: string;
  description: string;
  weeks: SeedWeek[];
}

const DOC = ResourceType.DOCUMENTATION;

// Each phase is exactly 4 weeks (one "training month"), so the whole
// program runs exactly 12 weeks / 3 months. The real cohort curriculum this
// is based on ran the same content over more (non-contiguous) calendar
// weeks — here, weeks that were lighter on new material are folded into
// the same week as an adjacent one so nothing from the source material is
// dropped, just regrouped onto a clean 1–12 week numbering.
export const phasesData: SeedPhase[] = [
  // ─────────────────────────────────────────────────────────────────────
  // Phase 1 — Frontend Fundamentals (Weeks 1–4)
  // ─────────────────────────────────────────────────────────────────────
  {
    phaseNumber: 1,
    title: "Frontend Fundamentals",
    description:
      "Core JavaScript, the command line and Git, then HTML/CSS and the DOM — building up to two solo projects.",
    weeks: [
      {
        weekNumber: 1,
        title: "JavaScript Fundamentals",
        description:
          "Programming fundamentals, JavaScript basics, the command line and Git, then scope, arrays and objects.",
        objectives: [
          "Write and run basic JavaScript programs",
          "Navigate and operate confidently from the command line",
          "Initialize a Git repository, commit and push to GitHub",
          "Define and call functions, and write conditional logic",
          "Understand function/block scope at a basic level",
          "Manipulate arrays and model data with objects",
        ],
        topics: ["Introduction To JS", "Command Line & GIT", "Functions", "Conditionals", "Scopes", "Arrays", "Objects"],
        resources: [
          {
            title: "MDN — JavaScript Guide",
            description: "The canonical guide to core JavaScript concepts.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 90,
            topic: "Introduction To JS",
          },
          {
            title: "Git Documentation",
            description: "Official Git reference and guides.",
            url: "https://git-scm.com/doc",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "Command Line & GIT",
          },
          {
            title: "MDN — Arrays",
            description: "Reference for array creation and manipulation.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "Arrays",
          },
          {
            title: "MDN — Working with objects",
            description: "How objects work in JavaScript.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 30,
            topic: "Objects",
          },
        ],
        tasks: [
          {
            code: "JS-001",
            title: "Variables & Conditionals Practice",
            description: "Small warm-up exercises covering variables, operators and conditional logic.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.EASY,
            points: 10,
            estimatedHours: 1.5,
            instructions:
              "Write a few small functions: classify a number as positive/negative/zero, compute a letter grade from a score, and check if a year is a leap year. Commit your work with clear, incremental Git commits.",
            acceptanceCriteria: [
              "Each function handles its edge cases (0, negative numbers, boundary scores)",
              "At least 3 separate, meaningful Git commits",
              "Pushed to a public GitHub repository",
            ],
          },
          {
            code: "JS-002",
            title: "Array & Object Manipulation",
            description: "Practice working with arrays of objects — a very common real-world shape.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 2,
            instructions:
              "Given an array of student objects (name, grades[]), write functions to add/remove a student, compute each student's average, and find the top-scoring student. Do not mutate the original array.",
            acceptanceCriteria: [
              "Original input array/objects are never mutated",
              "Handles an empty list gracefully",
              "Pushed to GitHub",
            ],
          },
        ],
        researchQuestions: ["What is the difference between var, let and const?"],
        submissionRequirements: ["Public GitHub repository URL"],
      },
      {
        weekNumber: 2,
        title: "Iteration, Recursion, HOF & OOP",
        description:
          "Loops in depth, solving problems recursively, callbacks and higher-order functions, and object-oriented programming.",
        objectives: [
          "Choose the right loop construct for a problem",
          "Trace and write recursive functions",
          "Write and use callback functions and higher-order functions",
          "Model problems with classes and objects (OOP)",
        ],
        topics: ["Iteration Part-1", "Iteration Part-2", "Recursion", "CB & HOF", "OOP"],
        resources: [
          {
            title: "MDN — Loops and iteration",
            description: "for, while, for...of and for...in compared.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 30,
            topic: "Iteration Part-1",
          },
          {
            title: "MDN — Array.prototype methods",
            description: "map, filter, reduce and other higher-order array methods.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "CB & HOF",
          },
        ],
        tasks: [
          {
            code: "JS-003",
            title: "Recursion Practice",
            description: "Classic recursive problems.",
            type: TaskType.PROBLEM_SOLVING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 1.5,
            instructions:
              "Implement factorial, a Fibonacci sequence generator, and a function that sums nested arrays of arbitrary depth — all recursively.",
            acceptanceCriteria: [
              "No loops used in any of the three solutions",
              "Each has a correct base case",
              "Pushed to GitHub",
            ],
          },
          {
            code: "JS-004",
            title: "OOP & Higher-Order Functions",
            description: "Combine classes with array higher-order methods.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 12,
            estimatedHours: 2,
            instructions:
              "Build a small `Library` class that holds `Book` instances (title, author, isCheckedOut). Add methods to check a book in/out, and use map/filter/reduce to report available books and books by a given author.",
            acceptanceCriteria: [
              "Uses at least one class with a constructor and methods",
              "Uses map/filter/reduce rather than manual loops for the reporting methods",
              "Pushed to GitHub",
            ],
          },
        ],
        researchQuestions: [
          "What is a base case, and what happens if a recursive function is missing one?",
          "What's the difference between a regular function and an arrow function with respect to `this`?",
        ],
        submissionRequirements: ["Public GitHub repository URL"],
      },
      {
        weekNumber: 3,
        title: "HTML/CSS, DOM, jQuery & Project 1",
        description:
          "A first look at HTML and CSS, deeper CSS (layout and positioning), design fundamentals, DOM manipulation, jQuery, and your first solo project.",
        objectives: [
          "Structure a page with semantic HTML and style it with CSS",
          "Build multi-column and flex/grid page layouts, and position elements correctly",
          "Apply basic design fundamentals (spacing, hierarchy, contrast)",
          "Read and manipulate the DOM from JavaScript, including with jQuery",
          "Scaffold and plan a new project from scratch",
        ],
        topics: [
          "CSS Introduction",
          "HTML",
          "CSS Part-2 Page Layouts",
          "CSS Part-3 Position",
          "Design Fundamentals",
          "DOM Manipulation",
          "How To Start A Project",
          "JQuery",
        ],
        resources: [
          {
            title: "MDN — HTML basics",
            description: "Structuring content with HTML.",
            url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "HTML",
          },
          {
            title: "MDN — CSS first steps",
            description: "Getting started with CSS.",
            url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "CSS Introduction",
          },
          {
            title: "MDN — CSS layout",
            description: "Flexbox, Grid and page layout techniques.",
            url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "CSS Part-2 Page Layouts",
          },
          {
            title: "MDN — Introduction to the DOM",
            description: "Reading and manipulating the DOM.",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "DOM Manipulation",
          },
          {
            title: "jQuery Documentation",
            description: "Official jQuery API documentation.",
            url: "https://api.jquery.com/",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 30,
            topic: "JQuery",
          },
        ],
        tasks: [
          {
            code: "WEB-001",
            title: "jQuery DOM Practice",
            description: "Rebuild a small piece of DOM-manipulation UI using jQuery instead of vanilla JS.",
            type: TaskType.CODING,
            priority: TaskPriority.LOW,
            difficulty: TaskDifficulty.EASY,
            points: 6,
            estimatedHours: 1,
            instructions: "Build a simple to-do list (add/remove/toggle-complete items) using only jQuery for DOM manipulation and events.",
            acceptanceCriteria: ["No vanilla querySelector/addEventListener used — jQuery only", "Pushed to GitHub"],
          },
          {
            code: "PROJ-1",
            title: "Project 1",
            description: "Your first solo project.",
            type: TaskType.PROJECT,
            priority: TaskPriority.HIGH,
            difficulty: TaskDifficulty.MEDIUM,
            points: 25,
            estimatedHours: 10,
            instructions:
              "Build a static, multi-page site with plain HTML, CSS and vanilla JavaScript DOM manipulation — no frameworks. Plan it out in a short wiki before you start building.",
            acceptanceCriteria: [
              "At least 3 distinct pages/views with working navigation",
              "Uses DOM manipulation for at least one interactive feature",
              "A short project wiki/README describing the plan and features",
            ],
            isWeeklyProject: true,
          },
        ],
        researchQuestions: [],
        weeklyProjectTitle: "Project 1",
        weeklyProjectDescription:
          "Your first solo project: a static, multi-page site built with plain HTML, CSS and vanilla JavaScript DOM manipulation — no frameworks. Plan it out in a short wiki before you start building.",
        submissionRequirements: ["Public GitHub repository URL", "Project wiki/README describing the plan and features", "Live demo URL (optional)"],
      },
      {
        weekNumber: 4,
        title: "Project 2",
        description: "A second, more ambitious frontend project applying everything from this phase.",
        objectives: ["Independently plan and scope a small frontend application", "Apply HTML/CSS/JS and DOM skills without step-by-step guidance"],
        topics: [],
        resources: [],
        tasks: [
          {
            code: "PROJ-2",
            title: "Project 2",
            description: "A second, more ambitious solo frontend project.",
            type: TaskType.PROJECT,
            priority: TaskPriority.HIGH,
            difficulty: TaskDifficulty.MEDIUM,
            points: 25,
            estimatedHours: 12,
            instructions:
              "Independently plan and build a small frontend application, applying everything from Phase 1 (HTML/CSS/JS/DOM). Write a short wiki plan before you start.",
            acceptanceCriteria: [
              "Built independently from a short wiki plan",
              "Demonstrates DOM manipulation, event handling and a clear visual design",
              "Pushed to a public GitHub repository",
            ],
            isWeeklyProject: true,
          },
        ],
        researchQuestions: [],
        weeklyProjectTitle: "Project 2",
        weeklyProjectDescription:
          "A second solo frontend project, built independently from a short wiki plan — the capstone for Phase 1.",
        submissionRequirements: ["Public GitHub repository URL", "Project wiki/README", "Live demo URL (optional)"],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // Phase 2 — Backend & React Development (Weeks 5–8)
  // ─────────────────────────────────────────────────────────────────────
  {
    phaseNumber: 2,
    title: "Backend & React Development",
    description: "Node/Express APIs, authentication, and building real UIs with React.",
    weeks: [
      {
        weekNumber: 5,
        title: "Backend Development & Express.js",
        description: "What a backend does, building REST APIs, asynchronous JavaScript, and Express middleware.",
        objectives: [
          "Explain what a backend server does and how clients talk to it",
          "Design a basic REST API",
          "Use async/await and handle asynchronous errors",
          "Build routes and controllers with Express, and write custom middleware",
        ],
        topics: ["Backend Development", "APIs", "Asynchronous Programming", "Express Middlewares"],
        resources: [
          {
            title: "Node.js Documentation",
            description: "Official Node.js API documentation.",
            url: "https://nodejs.org/en/docs",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "Backend Development",
          },
          {
            title: "MDN — Using Promises",
            description: "How Promises and async/await work.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "Asynchronous Programming",
          },
          {
            title: "Express Documentation",
            description: "Official Express.js guide and API reference.",
            url: "https://expressjs.com/en/guide/routing.html",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "Express Middlewares",
          },
        ],
        tasks: [
          {
            code: "NODE-001",
            title: "Async JS & Fetch Practice",
            description: "Fetch data asynchronously and handle failure paths.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 1.5,
            instructions: "Write an async function that fetches from a public JSON API with proper try/catch error handling and a request timeout.",
            acceptanceCriteria: ["Handles network failure without crashing", "Uses async/await, not raw .then chains"],
          },
          {
            code: "NODE-002",
            title: "Express Middleware Practice",
            description: "Write custom Express middleware.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 1.5,
            instructions:
              "Build a small Express API with a request-logging middleware and an error-handling middleware. Follow Route → Controller → Service layering.",
            acceptanceCriteria: ["Logging middleware runs on every request", "Errors are caught by a dedicated error-handling middleware, not left to crash the process"],
          },
        ],
        researchQuestions: ["What is the JavaScript event loop, and why does it matter for a Node.js server?"],
        submissionRequirements: ["Public GitHub repository URL"],
      },
      {
        weekNumber: 6,
        title: "Authentication, Authorization & Project 3",
        description: "Securing an API with authentication and authorization, applied in a three-part project.",
        objectives: ["Implement password hashing and login with JWT", "Restrict routes by role"],
        topics: ["Authentication And Authorization"],
        resources: [
          {
            title: "OWASP — Authentication Cheat Sheet",
            description: "Best practices for implementing authentication securely.",
            url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 30,
            topic: "Authentication And Authorization",
          },
        ],
        tasks: [
          {
            code: "PROJ-3",
            title: "Project 3 (Part 1, 2, 3)",
            description: "A three-part backend project: REST API, then auth, then role-based authorization.",
            type: TaskType.PROJECT,
            priority: TaskPriority.URGENT,
            difficulty: TaskDifficulty.HARD,
            points: 30,
            estimatedHours: 14,
            instructions:
              "Part 1: build a REST API with proper Route → Controller → Service layering. Part 2: add authentication (password hashing + JWT). Part 3: add role-based authorization to protect specific routes.",
            acceptanceCriteria: [
              "All three parts are implemented and working end-to-end",
              "Passwords are hashed, never stored or returned in plaintext",
              "At least one route is protected by role, verified server-side",
            ],
            isWeeklyProject: true,
          },
        ],
        researchQuestions: ["Authentication vs Authorization — what's the difference?"],
        weeklyProjectTitle: "Project 3",
        weeklyProjectDescription:
          "A three-part backend project (Part 1, 2, 3): build a REST API, then add authentication, then add role-based authorization — following Route → Controller → Service architecture throughout.",
        submissionRequirements: ["Public GitHub repository URL", "Pull request URL", ".env.example included (no real secrets)"],
      },
      {
        weekNumber: 7,
        title: "React Fundamentals",
        description: "Building UIs with React: components, hooks, and context.",
        objectives: ["Build components with props and state", "Use useState/useEffect correctly", "Share state across components with Context"],
        topics: ["React Intro", "React Hooks", "React Context"],
        resources: [
          {
            title: "React Documentation",
            description: "The official React documentation.",
            url: "https://react.dev/learn",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 120,
            topic: "React Intro",
          },
        ],
        tasks: [
          {
            code: "REACT-001",
            title: "React Hooks Practice",
            description: "Practice useState/useEffect with a small data-driven component.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 2,
            instructions: "Build a component that fetches a list from a public API in useEffect and shows loading/error/success states with useState.",
            acceptanceCriteria: ["Loading, error and success states are all visibly distinct", "Cleans up correctly if the component unmounts mid-fetch"],
          },
        ],
        researchQuestions: ["When should useEffect be used, and when should it be avoided?"],
        submissionRequirements: ["Public GitHub repository URL"],
      },
      {
        weekNumber: 8,
        title: "React Router, Redux & Project 4",
        description: "Client-side routing and global state management, applied in a solo project.",
        objectives: ["Set up multi-page navigation with React Router", "Manage global state with Redux"],
        topics: ["React Router", "Redux"],
        resources: [
          {
            title: "React Router Documentation",
            description: "Official docs for React Router.",
            url: "https://reactrouter.com/en/main",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "React Router",
          },
          {
            title: "Redux Documentation",
            description: "Official Redux documentation.",
            url: "https://redux.js.org/",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "Redux",
          },
        ],
        tasks: [
          {
            code: "PROJ-4",
            title: "Project 4 (Solo)",
            description: "A solo React application with routing and Redux.",
            type: TaskType.PROJECT,
            priority: TaskPriority.HIGH,
            difficulty: TaskDifficulty.HARD,
            points: 30,
            estimatedHours: 15,
            instructions:
              "Build a full React application with multi-page routing (React Router) and global state managed with Redux. Write a short wiki plan before you start.",
            acceptanceCriteria: [
              "At least 3 routed pages with working navigation",
              "Global state is managed with Redux, not just local component state",
              "A short project wiki/README describing the plan and features",
            ],
            isWeeklyProject: true,
          },
        ],
        researchQuestions: ["Redux vs React Context — when would you reach for one over the other?"],
        weeklyProjectTitle: "Project 4 (Solo)",
        weeklyProjectDescription:
          "A solo full React application with multi-page routing (React Router) and global state managed with Redux — the capstone for Phase 2.",
        submissionRequirements: ["Public GitHub repository URL", "Project wiki/README", "Live demo URL (optional)"],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // Phase 3 — Databases, TypeScript & Team Projects (Weeks 9–12)
  // ─────────────────────────────────────────────────────────────────────
  {
    phaseNumber: 3,
    title: "Databases, TypeScript & Team Projects",
    description: "Relational databases, TypeScript, Next.js, working as a team on GitHub, and data structures & algorithms.",
    weeks: [
      {
        weekNumber: 9,
        title: "PostgreSQL & Relational Databases",
        description: "Relational database design and SQL.",
        objectives: ["Design normalized relational tables", "Write SQL queries: CRUD, filtering, joins, aggregation"],
        topics: ["PostgreSQL", "Relational_Databases"],
        resources: [
          {
            title: "PostgreSQL Documentation",
            description: "Official PostgreSQL manual.",
            url: "https://www.postgresql.org/docs/current/",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 90,
            topic: "PostgreSQL",
          },
        ],
        tasks: [
          {
            code: "SQL-001",
            title: "SQL Queries Practice",
            description: "Practice core SQL against a small relational schema.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 1.5,
            instructions: "Design `users` and `posts` tables, then write queries covering WHERE/ORDER BY/LIMIT, an aggregate with GROUP BY, and a JOIN across both tables.",
            acceptanceCriteria: ["Tables have appropriate primary/foreign keys", "All required query types are included and run successfully"],
          },
        ],
        researchQuestions: ["INNER JOIN vs LEFT JOIN — what's the difference, with an example?"],
        submissionRequirements: ["Public GitHub repository URL with .sql files"],
      },
      {
        weekNumber: 10,
        title: "TypeScript & Next.js",
        description: "Adding static types with TypeScript, and building full-stack React apps with Next.js.",
        objectives: [
          "Use TypeScript's core type system (interfaces, unions, generics)",
          "Build pages and API routes with Next.js",
        ],
        topics: ["TypeScript", "Next.js Intro", "Next-API"],
        resources: [
          {
            title: "TypeScript Handbook",
            description: "The official TypeScript language handbook.",
            url: "https://www.typescriptlang.org/docs/handbook/intro.html",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 90,
            topic: "TypeScript",
          },
          {
            title: "Next.js Documentation",
            description: "Official Next.js documentation.",
            url: "https://nextjs.org/docs",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "Next.js Intro",
          },
        ],
        tasks: [
          {
            code: "TS-001",
            title: "TypeScript & Next.js Practice",
            description: "Convert a small module to TypeScript and build a Next.js API route.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 2,
            instructions:
              "Type a small existing JS module (no `any`), then build a Next.js page that calls a Next.js API route (app/pages router, either is fine) and renders the typed response.",
            acceptanceCriteria: ["Compiles with strict mode, no errors", "The API route and the page both have proper TypeScript types"],
          },
        ],
        researchQuestions: [],
        submissionRequirements: ["Public GitHub repository URL"],
      },
      {
        weekNumber: 11,
        title: "Team Collaboration & Project 5",
        description: "Working as a team on GitHub, culminating in a team project.",
        objectives: ["Collaborate on GitHub using teams, branches and pull request review", "Deliver a project as part of a team"],
        topics: ["GitHub Teams"],
        resources: [
          {
            title: "GitHub Docs — About teams",
            description: "How GitHub Teams work for collaboration.",
            url: "https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 20,
            topic: "GitHub Teams",
          },
        ],
        tasks: [
          {
            code: "PROJ-5",
            title: "Project 5 (Team)",
            description: "A team project built and reviewed together on GitHub.",
            type: TaskType.PROJECT,
            priority: TaskPriority.URGENT,
            difficulty: TaskDifficulty.HARD,
            points: 30,
            estimatedHours: 16,
            instructions:
              "As a GitHub team, plan the project together in a shared wiki, split work across feature branches, and merge through reviewed pull requests.",
            acceptanceCriteria: [
              "A shared project wiki documenting the plan and each member's part",
              "Work was done on feature branches merged via reviewed pull requests, not directly to main",
              "The submitted repository URL is the shared team repository",
            ],
            isWeeklyProject: true,
          },
        ],
        researchQuestions: ["What makes code review effective on a team, beyond just checking for bugs?"],
        weeklyProjectTitle: "Project 5 (Team)",
        weeklyProjectDescription:
          "A team project: plan together in a shared wiki, split work across feature branches, and merge through reviewed pull requests as a GitHub team.",
        submissionRequirements: ["Public GitHub repository URL (team repo)", "Project wiki/README", "Pull request URL(s)"],
      },
      {
        weekNumber: 12,
        title: "Data Structures & Algorithms",
        description: "Core data structures and how to reason about algorithmic efficiency.",
        objectives: [
          "Implement and reason about the trade-offs of stacks, queues, linked lists and trees",
          "Analyze the time complexity of an algorithm",
        ],
        topics: ["Time Complexity", "Stack Data Structure", "Queue Data Structure", "Linked List Data Structure", "Tree Data Structure"],
        resources: [
          {
            title: "MDN — Big O notation primer",
            description: "A practical introduction to algorithmic complexity.",
            url: "https://developer.mozilla.org/en-US/docs/Glossary/Big_O_notation",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 20,
            topic: "Time Complexity",
          },
        ],
        tasks: [
          {
            code: "DS-001",
            title: "Implement a Stack",
            description: "Build a stack from scratch.",
            type: TaskType.PROBLEM_SOLVING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.EASY,
            points: 6,
            estimatedHours: 1,
            instructions: "Implement a Stack class with push, pop, peek and isEmpty, backed by a plain array (do not use a library).",
            acceptanceCriteria: ["pop()/peek() on an empty stack is handled explicitly (no silent crash)", "Solution pushed to GitHub"],
          },
          {
            code: "DS-002",
            title: "Implement a Queue",
            description: "Build a queue from scratch.",
            type: TaskType.PROBLEM_SOLVING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.EASY,
            points: 6,
            estimatedHours: 1,
            instructions: "Implement a Queue class with enqueue, dequeue, front and isEmpty.",
            acceptanceCriteria: ["dequeue() on an empty queue is handled explicitly", "Solution pushed to GitHub"],
          },
          {
            code: "DS-003",
            title: "Implement a Linked List",
            description: "Build a singly linked list from scratch.",
            type: TaskType.PROBLEM_SOLVING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 8,
            estimatedHours: 1.5,
            instructions: "Implement a singly linked list with insert (head/tail), delete and search/traverse.",
            acceptanceCriteria: ["Handles deleting the head node correctly", "Solution pushed to GitHub"],
          },
          {
            code: "DS-004",
            title: "Implement a Binary Tree",
            description: "Build a binary search tree from scratch.",
            type: TaskType.PROBLEM_SOLVING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.HARD,
            points: 10,
            estimatedHours: 2,
            instructions: "Implement a binary search tree with insert, search, and an in-order traversal.",
            acceptanceCriteria: ["In-order traversal returns values in sorted order", "Solution pushed to GitHub"],
          },
          {
            code: "DS-005",
            title: "Time Complexity Analysis",
            description: "Analyze the Big-O of your own implementations.",
            type: TaskType.RESEARCH,
            priority: TaskPriority.LOW,
            difficulty: TaskDifficulty.MEDIUM,
            points: 6,
            estimatedHours: 1,
            instructions: "For each of your Stack, Queue, Linked List and Tree implementations, write down the time complexity of each operation and justify it in a README.",
            acceptanceCriteria: ["Every public method has a stated Big-O with a one-line justification"],
          },
        ],
        researchQuestions: ["Why is a hash map's average-case lookup O(1), and when does it degrade?"],
        submissionRequirements: ["Public GitHub repository URL"],
      },
    ],
  },
];
