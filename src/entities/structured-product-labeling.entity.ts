import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

interface ICD10Mapping {
  code: string;
  description: string;
  confidence: number;
}

interface IndicationMapping {
  original: string;
  icd10Codes: ICD10Mapping[];
  unmappedTerms?: string[];
}

interface EligibilityRequirement {
  name: string;
  value: string;
}

@Entity('structured_product_labeling')
export class StructuredProductLabeling extends BaseEntity {
  @Column({ name: 'set_id', unique: true })
  setId: string;

  @Column({ name: 'drug_name', nullable: true })
  drugName?: string;

  @Column({ name: 'indications', type: 'jsonb' })
  indications: IndicationMapping[];

  @Column({ name: 'last_update_date', type: 'date' })
  lastUpdateDate: Date;

  @Column({ name: 'eligibility_requirements', type: 'jsonb', nullable: true })
  eligibilityRequirements?: EligibilityRequirement[];
}
