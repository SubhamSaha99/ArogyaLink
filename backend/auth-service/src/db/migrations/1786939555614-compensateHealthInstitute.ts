import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompensateHealthInstitute1786939555614 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION compensate_health_institute_registration(
            p_health_institute_primary_key INT
        )
        RETURNS VARCHAR(20)
        LANGUAGE plpgsql
        AS $$
        DECLARE
            v_sqlstate TEXT;
            v_message TEXT;
            v_detail TEXT;
        BEGIN
            DELETE
            FROM health_institute hi
            WHERE hi.id = p_health_institute_primary_key;
            IF NOT FOUND THEN
                RETURN 'helathInstituteNotFound';
            END IF;
            RETURN 'success';
        EXCEPTION
            WHEN OTHERS THEN
                GET STACKED DIAGNOSTICS
                    v_sqlstate = RETURNED_SQLSTATE,
                    v_message = MESSAGE_TEXT,
                    v_detail = PG_EXCEPTION_DETAIL;
                INSERT INTO db_exception_log (
                    procedure_name,
                    error_code,
                    error_message,
                    error_details,
                    created_at
                )
                VALUES (
                    'compensate_health_institute_registration',
                    v_sqlstate,
                    v_message,
                    COALESCE(v_detail, ''),
                    NOW()
                );
                RETURN 'dbError';
        END;
        $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS compensate_health_institute_registration(INT);
      `);
  }
}
