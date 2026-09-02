import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHealthInstituteProfile1786904208952 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION create_health_institute_profile(
				p_health_institute_primary_key INTEGER,
                p_health_institute_id VARCHAR(20),
                p_health_institute_name VARCHAR(255),
                p_health_institute_type SMALLINT,
                p_email VARCHAR(255)
            )
            RETURNS VARCHAR(50)
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
                v_health_institute_id VARCHAR(20);
            BEGIN

                INSERT INTO health_institute_profile (
					health_institute_primary_key,
                    health_institute_id,
                    health_institute_name,
                    health_institute_type,
                    email,
                    created_at
                )
                VALUES (
					p_health_institute_primary_key,
                    p_health_institute_id,
                    p_health_institute_name,
                    p_health_institute_type,
                    p_email,
                    NOW()
                )
                RETURNING health_institute_id INTO v_health_institute_id;

                RETURN v_health_institute_id;

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
                        'create_health_institute_profile',
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
            DROP FUNCTION IF EXISTS create_health_institute_profile(INTEGER, VARCHAR, VARCHAR, SMALLINT, VARCHAR);
        `);
  }
}
