import { MigrationInterface, QueryRunner } from 'typeorm';

export class GetRegistrationCouncils1787564992514 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_registration_councils()
            RETURNS TABLE (
                id SMALLINT,
                name VARCHAR,
                code VARCHAR
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
            BEGIN

                RETURN QUERY
                SELECT
                    rc.id,
                    rc.council_name AS name,
                    rc.council_code AS code
                FROM registration_council_master rc
                WHERE rc.is_active = TRUE
                ORDER BY rc.id ASC;


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
                        'get_registration_councils',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );

                    RETURN;

            END;
            $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP FUNCTION get_registration_councils();
        `);
  }
}
