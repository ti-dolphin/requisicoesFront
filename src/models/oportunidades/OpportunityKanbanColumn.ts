import { Card as KanbanCard } from "@caldwell619/react-kanban";
import { Opportunity } from "./Opportunity";

export interface OpportunityKanbanColumn {
  id: number;
  name: string;
  board: string;
}

export interface OpportunityKanbanCardData extends KanbanCard {
  id: number;
  opportunity: Opportunity;
}
