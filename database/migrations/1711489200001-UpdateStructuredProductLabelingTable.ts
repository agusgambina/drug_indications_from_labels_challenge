import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStructuredProductLabelingTable1711489200001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop columns we no longer need
    await queryRunner.query(`
      ALTER TABLE "structured_product_labeling"
      DROP COLUMN IF EXISTS "application_number",
      DROP COLUMN IF EXISTS "ndc_code",
      DROP COLUMN IF EXISTS "drug_name",
      DROP COLUMN IF EXISTS "generic_name",
      DROP COLUMN IF EXISTS "brand_name",
      DROP COLUMN IF EXISTS "manufacturer",
      DROP COLUMN IF EXISTS "product_type",
      DROP COLUMN IF EXISTS "dosage_form",
      DROP COLUMN IF EXISTS "route_of_administration",
      DROP COLUMN IF EXISTS "drug_class",
      DROP COLUMN IF EXISTS "active_ingredients",
      DROP COLUMN IF EXISTS "inactive_ingredients",
      DROP COLUMN IF EXISTS "indications_and_usage",
      DROP COLUMN IF EXISTS "contraindications",
      DROP COLUMN IF EXISTS "warnings_and_precautions",
      DROP COLUMN IF EXISTS "adverse_reactions",
      DROP COLUMN IF EXISTS "drug_interactions",
      DROP COLUMN IF EXISTS "dosage_and_administration",
      DROP COLUMN IF EXISTS "how_supplied",
      DROP COLUMN IF EXISTS "storage_conditions",
      DROP COLUMN IF EXISTS "labeler_code",
      DROP COLUMN IF EXISTS "marketing_category",
      DROP COLUMN IF EXISTS "marketing_start_date",
      DROP COLUMN IF EXISTS "marketing_end_date",
      DROP COLUMN IF EXISTS "dea_schedule",
      DROP COLUMN IF EXISTS "packaging",
      DROP COLUMN IF EXISTS "has_rems",
      DROP COLUMN IF EXISTS "version_number",
      DROP COLUMN IF EXISTS "effective_date",
      DROP COLUMN IF EXISTS "label_type"
    `);

    // Add new columns
    await queryRunner.query(`
      ALTER TABLE "structured_product_labeling"
      ADD COLUMN IF NOT EXISTS "ndc_codes" text[],
      ADD COLUMN IF NOT EXISTS "indications" text,
      ADD COLUMN IF NOT EXISTS "last_update_date" date
    `);

    // Ensure set_id is unique
    await queryRunner.query(`
      ALTER TABLE "structured_product_labeling"
      ADD CONSTRAINT "UQ_structured_product_labeling_set_id" UNIQUE ("set_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the unique constraint
    await queryRunner.query(`
      ALTER TABLE "structured_product_labeling"
      DROP CONSTRAINT IF EXISTS "UQ_structured_product_labeling_set_id"
    `);

    // Drop the new columns
    await queryRunner.query(`
      ALTER TABLE "structured_product_labeling"
      DROP COLUMN IF EXISTS "ndc_codes",
      DROP COLUMN IF EXISTS "indications",
      DROP COLUMN IF EXISTS "last_update_date"
    `);

    // Restore the original columns
    await queryRunner.query(`
      ALTER TABLE "structured_product_labeling"
      ADD COLUMN "application_number" character varying,
      ADD COLUMN "ndc_code" character varying,
      ADD COLUMN "drug_name" character varying,
      ADD COLUMN "generic_name" character varying,
      ADD COLUMN "brand_name" character varying,
      ADD COLUMN "manufacturer" character varying,
      ADD COLUMN "product_type" character varying,
      ADD COLUMN "dosage_form" character varying,
      ADD COLUMN "route_of_administration" character varying,
      ADD COLUMN "drug_class" text[],
      ADD COLUMN "active_ingredients" jsonb,
      ADD COLUMN "inactive_ingredients" text[],
      ADD COLUMN "indications_and_usage" text,
      ADD COLUMN "contraindications" text,
      ADD COLUMN "warnings_and_precautions" text,
      ADD COLUMN "adverse_reactions" text,
      ADD COLUMN "drug_interactions" text,
      ADD COLUMN "dosage_and_administration" text,
      ADD COLUMN "how_supplied" text,
      ADD COLUMN "storage_conditions" text,
      ADD COLUMN "labeler_code" character varying,
      ADD COLUMN "marketing_category" character varying,
      ADD COLUMN "marketing_start_date" date,
      ADD COLUMN "marketing_end_date" date,
      ADD COLUMN "dea_schedule" character varying,
      ADD COLUMN "packaging" jsonb,
      ADD COLUMN "has_rems" boolean DEFAULT false,
      ADD COLUMN "version_number" integer,
      ADD COLUMN "effective_date" date,
      ADD COLUMN "label_type" character varying
    `);
  }
} 