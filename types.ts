export type Mode = 'Normal' | 'Health';

export interface BoundingBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export interface NormalIdentification {
  name: string;
  description: string;
  cool_facts: string[];
  technicalities: string;
  wikipedia_url: string;
  boundingBox: BoundingBox;
}

export interface HealthIdentification {
  issue: string;
  description: string;
  simple_cures: string[];
  natural_remedies: string[];
  boundingBox: BoundingBox;
}

export type Identification = (NormalIdentification & { name: string; issue?: never; }) | (HealthIdentification & { issue: string; name?: never; });
