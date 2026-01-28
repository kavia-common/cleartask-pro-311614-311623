import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders sidebar and main title", () => {
  render(<App />);
  expect(screen.getByText(/ClearTask/i)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /Today|Upcoming|Overdue|Completed|Labels/i })).toBeInTheDocument();
});
