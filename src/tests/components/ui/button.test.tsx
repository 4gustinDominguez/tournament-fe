import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  it("applies the default variant classes by default", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary");
  });

  it("applies the outline variant classes", () => {
    render(<Button variant="outline">Cancelar</Button>);
    expect(screen.getByRole("button")).toHaveClass("border-input");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole("button", { name: "Click" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled", () => {
    render(<Button disabled>No</Button>);
    expect(screen.getByRole("button", { name: "No" })).toBeDisabled();
  });
});
