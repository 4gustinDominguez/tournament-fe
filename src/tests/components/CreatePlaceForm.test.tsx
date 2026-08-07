import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreatePlaceForm } from "@/components/CreatePlaceForm";

const saveMock = vi.hoisted(() => vi.fn());

vi.mock("@/modules/places/infrastructure/api-place-repository", () => ({
  createApiPlaceRepository: () => ({ save: saveMock }),
}));

beforeEach(() => {
  saveMock.mockReset();
});

describe("CreatePlaceForm", () => {
  it("renders the name, location and capacity fields", () => {
    render(<CreatePlaceForm onPlaceCreated={() => {}} tournamentId="t1" />);
    expect(
      screen.getByPlaceholderText("CreatePlaceForm.namePlaceholder"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("CreatePlaceForm.locationPlaceholder"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("CreatePlaceForm.capacityPlaceholder"),
    ).toBeInTheDocument();
  });

  it("saves the place with numeric capacity", async () => {
    const user = userEvent.setup();
    const onPlaceCreated = vi.fn();
    saveMock.mockResolvedValueOnce(undefined);
    render(<CreatePlaceForm onPlaceCreated={onPlaceCreated} tournamentId="t1" />);

    await user.type(
      screen.getByPlaceholderText("CreatePlaceForm.namePlaceholder"),
      "Estadio Central",
    );
    await user.type(
      screen.getByPlaceholderText("CreatePlaceForm.locationPlaceholder"),
      "Centro",
    );
    await user.type(
      screen.getByPlaceholderText("CreatePlaceForm.capacityPlaceholder"),
      "5000",
    );
    await user.click(screen.getByRole("button", { name: "CreatePlaceForm.save" }));

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith({
      name: "Estadio Central",
      tournamentId: "t1",
      location: "Centro",
      capacity: 5000,
    });
    expect(onPlaceCreated).toHaveBeenCalled();
  });

  it("saves the place without capacity and resets the form", async () => {
    const user = userEvent.setup();
    const onPlaceCreated = vi.fn();
    saveMock.mockResolvedValueOnce(undefined);
    render(<CreatePlaceForm onPlaceCreated={onPlaceCreated} tournamentId="t1" />);

    await user.type(
      screen.getByPlaceholderText("CreatePlaceForm.namePlaceholder"),
      "Parque Este",
    );
    await user.click(screen.getByRole("button", { name: "CreatePlaceForm.save" }));

    expect(saveMock).toHaveBeenCalledWith({
      name: "Parque Este",
      tournamentId: "t1",
      location: "",
      capacity: undefined,
    });
    expect(onPlaceCreated).toHaveBeenCalledTimes(1);
    expect(screen.getByPlaceholderText("CreatePlaceForm.namePlaceholder")).toHaveValue("");
  });
});
