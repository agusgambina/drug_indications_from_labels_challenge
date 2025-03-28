import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('structured_product_labeling')
export class StructuredProductLabeling extends BaseEntity {
  @Column({ name: 'set_id', unique: true })
  setId: string;

  @Column({ name: 'ndc_codes', type: 'text', array: true })
  ndcCodes: string[];

  @Column({ name: 'indications', type: 'text', nullable: true })
  indications: string;

  @Column({ name: 'last_update_date', type: 'date' })
  lastUpdateDate: Date;
}
