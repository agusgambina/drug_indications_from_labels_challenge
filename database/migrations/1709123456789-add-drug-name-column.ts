import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDrugNameColumn1709123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE structured_product_labeling
      ADD COLUMN drug_name VARCHAR(255);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE structured_product_labeling
      DROP COLUMN drug_name;
    `);
  }
} 