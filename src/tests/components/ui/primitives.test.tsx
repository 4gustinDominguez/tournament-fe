import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Oficial</Badge>);
    expect(screen.getByText("Oficial")).toBeInTheDocument();
  });

  it("applies the default variant classes", () => {
    render(<Badge>X</Badge>);
    expect(screen.getByText("X")).toHaveClass("bg-primary");
  });

  it("applies the outline variant classes", () => {
    render(<Badge variant="outline">X</Badge>);
    expect(screen.getByText("X")).not.toHaveClass("bg-primary");
  });
});

describe("Card", () => {
  it("renders header, title, description, content and footer", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título</CardTitle>
          <CardDescription>Descripción</CardDescription>
        </CardHeader>
        <CardContent>Contenido</CardContent>
        <CardFooter>Pie</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
    expect(screen.getByText("Pie")).toBeInTheDocument();
  });
});

describe("Input", () => {
  it("renders a text input by default and forwards props", () => {
    render(<Input placeholder="Nombre" defaultValue="Juan" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "Nombre");
    expect(input).toHaveValue("Juan");
  });

  it("renders a password input when type is password", () => {
    render(<Input type="password" aria-label="Clave" />);
    expect(screen.getByLabelText("Clave")).toHaveAttribute("type", "password");
  });

  it("is disabled when disabled", () => {
    render(<Input disabled aria-label="Campo" />);
    expect(screen.getByLabelText("Campo")).toBeDisabled();
  });
});

describe("Label", () => {
  it("associates with a control via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email">Correo</Label>
        <Input id="email" />
      </>,
    );
    expect(screen.getByText("Correo")).toHaveAttribute("for", "email");
  });
});

describe("Skeleton", () => {
  it("renders with the base animation classes", () => {
    const { container } = render(<Skeleton className="h-10 w-10" />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("h-10");
  });
});

describe("Avatar", () => {
  it("renders the fallback when no image is provided", () => {
    render(
      <Avatar>
        <AvatarImage src="/missing.png" alt="Foto" />
        <AvatarFallback>AG</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("AG")).toBeInTheDocument();
  });
});

describe("Checkbox", () => {
  it("toggles between unchecked and checked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Checkbox onCheckedChange={onCheckedChange} aria-label="Acepto" />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Acepto" });
    expect(checkbox).not.toHaveAttribute("data-state", "checked");

    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });

  it("respects the checked prop", () => {
    render(<Checkbox checked aria-label="Marcado" />);
    expect(screen.getByRole("checkbox", { name: "Marcado" })).toHaveAttribute(
      "data-state",
      "checked",
    );
  });
});

describe("Tabs", () => {
  it("switches content when a different tab is activated", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="partidos">
        <TabsList>
          <TabsTrigger value="partidos">Partidos</TabsTrigger>
          <TabsTrigger value="equipos">Equipos</TabsTrigger>
        </TabsList>
        <TabsContent value="partidos">Contenido partidos</TabsContent>
        <TabsContent value="equipos">Contenido equipos</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Contenido partidos")).toBeInTheDocument();
    expect(
      screen.queryByText("Contenido equipos"),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Equipos" }));
    expect(screen.getByText("Contenido equipos")).toBeInTheDocument();
  });
});
