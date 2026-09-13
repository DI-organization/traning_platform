import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Training Management Platform API",
      version: "1.0.0",
      description:
        "REST API for managing a 12-week full-stack training program: trainees, weekly curriculum, tasks, submissions, GitHub-backed code review, evaluation and analytics.",
    },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            code: { type: "string" },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication" },
      { name: "Users", description: "The authenticated user's own profile" },
      { name: "Trainees", description: "Trainer-managed trainee accounts" },
      { name: "Programs", description: "Training program & curriculum" },
      { name: "Weeks", description: "Individual weeks: topics, locking, research questions" },
      { name: "Tasks", description: "Learning tasks and assignments" },
      { name: "Resources", description: "Learning resources (docs, articles, videos, ...)" },
      { name: "Submissions", description: "Trainee work submissions and trainer reviews" },
      { name: "Research", description: "Weekly research questions and trainee answers" },
      { name: "Notifications", description: "In-app notifications" },
      { name: "Analytics", description: "Trainer dashboard KPIs and program-wide analytics" },
      { name: "GitHub", description: "GitHub repository/PR metadata lookups" },
    ],
  },
  apis: ["./src/routes/*.ts"],
});
