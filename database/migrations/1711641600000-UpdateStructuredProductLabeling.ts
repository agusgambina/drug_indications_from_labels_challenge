import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStructuredProductLabeling1711641600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the ndc_codes column
        await queryRunner.query(`
            ALTER TABLE structured_product_labeling
            DROP COLUMN IF EXISTS ndc_codes;
        `);

        // Add new columns
        await queryRunner.query(`
            ALTER TABLE structured_product_labeling
            ADD COLUMN IF NOT EXISTS drug_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS indications JSONB,
            ADD COLUMN IF NOT EXISTS eligibility_requirements JSONB;
        `);

        // Update the indications column type from text to jsonb
        await queryRunner.query(`
            ALTER TABLE structured_product_labeling
            ALTER COLUMN indications TYPE JSONB USING indications::jsonb;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the changes
        await queryRunner.query(`
            ALTER TABLE structured_product_labeling
            DROP COLUMN IF EXISTS drug_name,
            DROP COLUMN IF EXISTS eligibility_requirements;
        `);

        // Revert indications back to text
        await queryRunner.query(`
            ALTER TABLE structured_product_labeling
            ALTER COLUMN indications TYPE TEXT;
        `);

        // Restore the ndc_codes column
        await queryRunner.query(`
            ALTER TABLE structured_product_labeling
            ADD COLUMN IF NOT EXISTS ndc_codes TEXT[];
        `);
    }
} 