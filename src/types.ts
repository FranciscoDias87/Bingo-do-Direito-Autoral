export interface BingoTerm {
  id: string;
  term: string;
  description: string;
}

export interface Cell {
  term: string;
  marked: boolean;
  called: boolean;
}

export interface BingoCard {
  id: string;
  ownerName: string;
  grid: Cell[][];
  dimension: number;
  winChecked?: boolean;
  isWinner?: boolean;
}

export interface DrawnItem {
  term: string;
  description: string;
  drawnAt: Date;
  order: number;
}
