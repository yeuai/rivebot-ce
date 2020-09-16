/**
 * Iob entity definition
 */
export interface IobEntity {
  name: string;
  value: string;
  text: string;
  start: number;
  end: number;
  extractor?: string;
  confidence?: number;
}
