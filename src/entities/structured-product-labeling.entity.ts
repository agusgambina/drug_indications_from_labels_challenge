import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('structured_product_labeling')
export class StructuredProductLabeling extends BaseEntity {
  @Column({ name: 'set_id', unique: true })
  setId: string;

  @Column({ name: 'application_number', nullable: true })
  applicationNumber: string;

  @Column({ name: 'ndc_code', nullable: true })
  ndcCode: string;

  @Column({ name: 'drug_name' })
  drugName: string;

  @Column({ name: 'generic_name', nullable: true })
  genericName: string;

  @Column({ name: 'brand_name', nullable: true })
  brandName: string;

  @Column({ name: 'manufacturer', nullable: true })
  manufacturer: string;

  @Column({ name: 'product_type', nullable: true })
  productType: string;

  @Column({ name: 'dosage_form', nullable: true })
  dosageForm: string;

  @Column({ name: 'route_of_administration', nullable: true })
  routeOfAdministration: string;

  @Column({ name: 'drug_class', type: 'text', array: true, nullable: true })
  drugClass: string[];

  @Column({ name: 'active_ingredients', type: 'jsonb', nullable: true })
  activeIngredients: {
    name: string;
    strength?: string;
    unit?: string;
  }[];

  @Column({
    name: 'inactive_ingredients',
    type: 'text',
    array: true,
    nullable: true,
  })
  inactiveIngredients: string[];

  @Column({ name: 'indications_and_usage', type: 'text', nullable: true })
  indicationsAndUsage: string;

  @Column({ name: 'contraindications', type: 'text', nullable: true })
  contraindications: string;

  @Column({ name: 'warnings_and_precautions', type: 'text', nullable: true })
  warningsAndPrecautions: string;

  @Column({ name: 'adverse_reactions', type: 'text', nullable: true })
  adverseReactions: string;

  @Column({ name: 'drug_interactions', type: 'text', nullable: true })
  drugInteractions: string;

  @Column({ name: 'dosage_and_administration', type: 'text', nullable: true })
  dosageAndAdministration: string;

  @Column({ name: 'how_supplied', type: 'text', nullable: true })
  howSupplied: string;

  @Column({ name: 'storage_conditions', type: 'text', nullable: true })
  storageConditions: string;

  @Column({ name: 'labeler_code', nullable: true })
  labelerCode: string;

  @Column({ name: 'marketing_category', nullable: true })
  marketingCategory: string;

  @Column({ name: 'marketing_start_date', type: 'date', nullable: true })
  marketingStartDate: Date;

  @Column({ name: 'marketing_end_date', type: 'date', nullable: true })
  marketingEndDate: Date;

  @Column({ name: 'dea_schedule', nullable: true })
  deaSchedule: string;

  @Column({ name: 'packaging', type: 'jsonb', nullable: true })
  packaging: {
    packageType: string;
    quantity?: number;
    unit?: string;
  }[];

  @Column({ name: 'has_rems', default: false })
  hasRems: boolean;

  @Column({ name: 'version_number' })
  versionNumber: number;

  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ name: 'label_type' })
  labelType: string;
}
