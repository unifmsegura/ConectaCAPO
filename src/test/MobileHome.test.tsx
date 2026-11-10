import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileHome } from "../components/mobile/MobileHome";
import type { Campaign } from "../types";

const campaigns: Campaign[] = [
    {
        id: "van",
        title: "Combustível da Van",
        description: "Transporte diário",
        goal: 1500,
        raised: 1200,
        priority: true,
    },
    {
        id: "eventos",
        title: "Eventos das Divas",
        description: "Encontros de integração",
        goal: 2500,
        raised: 1000,
    },
];

describe("MobileHome", () => {
    it("renders all campaigns", () => {
        render(<MobileHome campaigns={campaigns} onSelect={vi.fn()} />);
        expect(screen.getByText("Combustível da Van")).toBeInTheDocument();
        expect(screen.getByText("Eventos das Divas")).toBeInTheDocument();
    });

    it("shows the priority badge only for priority campaigns", () => {
        render(<MobileHome campaigns={campaigns} onSelect={vi.fn()} />);
        expect(screen.getByText("Meta Prioritária")).toBeInTheDocument();
    });

    it("caps the progress percentage at 100%", () => {
        const overGoal: Campaign[] = [{ ...campaigns[0], raised: 3000 }];
        render(<MobileHome campaigns={overGoal} onSelect={vi.fn()} />);
        expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("shows the correct rounded progress percent", () => {
        render(<MobileHome campaigns={campaigns} onSelect={vi.fn()} />);
        expect(screen.getByText("80%")).toBeInTheDocument();
        expect(screen.getByText("40%")).toBeInTheDocument();
    });

    it("calls onSelect with the campaign when the donate button is clicked", () => {
        const onSelect = vi.fn();
        render(<MobileHome campaigns={campaigns} onSelect={onSelect} />);
        fireEvent.click(screen.getAllByText("Doar para esta meta")[0]);
        expect(onSelect).toHaveBeenCalledWith(campaigns[0]);
    });
});
