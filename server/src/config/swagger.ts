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
      { name: "Trainees", description: "Trainer-managed trainee accounts" },
      { name: "Programs", description: "Training program & curriculum" },
      { name: "Tasks", description: "Learning tasks and assignments" },
      { name: "Submissions", description: "Trainee work submissions and trainer reviews" },
    ],
  },
  apis: ["./src/routes/*.ts"],
});
