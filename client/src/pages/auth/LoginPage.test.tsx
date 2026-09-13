import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/testUtils";
import LoginPage from "./LoginPage";
import * as authApi from "@/api/auth";

vi.mock("@/api/auth");
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders the email and password fields and a submit button", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors and does not call the API when submitted empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("submits the entered credentials to the login API", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      token: "fake-token",
      user: {
        id: "1",
        firstName: "Test",
        lastName: "Trainer",
        email: "trainer@example.com",
        role: "TRAINER",
        avatar: null,
        phone: null,
        githubUsername: null,
        isActive: true,
        mustChangePassword: false,
        lastLoginAt: null,
        createdAt: "",
        updatedAt: "",
      },
    });

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "trainer@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith("trainer@example.com", "Password123!");
    });
  });

  it("shows an error toast when the credentials are rejected", async () => {
    const { toast } = await import("sonner");
    vi.mocked(authApi.login).mockRejectedValue({
      isAxiosError: true,
      response: { data: { success: false, message: "Invalid email or password", code: "INVALID_CREDENTIALS" } },
    });

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "trainer@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
