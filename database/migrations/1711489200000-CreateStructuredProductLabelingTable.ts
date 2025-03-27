import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateStructuredProductLabelingTable1711489200000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'structured_product_labeling',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'set_id',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'application_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'ndc_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'drug_name',
            type: 'varchar',
          },
          {
            name: 'generic_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'brand_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'manufacturer',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'product_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'dosage_form',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'route_of_administration',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'drug_class',
            type: 'text[]',
            isNullable: true,
          },
          {
            name: 'active_ingredients',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'inactive_ingredients',
            type: 'text[]',
            isNullable: true,
          },
          {
            name: 'indications_and_usage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'contraindications',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'warnings_and_precautions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'adverse_reactions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'drug_interactions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'dosage_and_administration',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'how_supplied',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'storage_conditions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'labeler_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'marketing_category',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'marketing_start_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'marketing_end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'dea_schedule',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'packaging',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'has_rems',
            type: 'boolean',
            default: false,
          },
          {
            name: 'version_number',
            type: 'integer',
          },
          {
            name: 'effective_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'label_type',
            type: 'varchar',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create an extension for UUID support if it doesn't exist
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('structured_product_labeling');
  }
} 