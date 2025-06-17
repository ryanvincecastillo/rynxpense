import { Budget } from "../types";
import { DuplicateBudgetOptions } from "./duplicateBudgetOptions";

export interface DuplicateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  onDuplicate: (options: DuplicateBudgetOptions) => void;
  isLoading: boolean;
}