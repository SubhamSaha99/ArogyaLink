import { MigrationInterface, QueryRunner } from 'typeorm';

export class GetAppointDoctorMasterData1787585650705 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_appoint_doctor_master_data()
            RETURNS TABLE (
                status VARCHAR,
                departments JSONB,
                designations JSONB,
                "consultationScopes" JSONB
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
                    'SUCCESS'::VARCHAR AS status,
                    COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', d.id,
                                    'name', d.department_name,
                                    'code', d.department_code
                                )
                                ORDER BY d.department_name
                            )
                            FROM department_master d
                            WHERE d.is_active = TRUE
                        ),
                        '[]'::JSONB
                    ) AS departments,
                    COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', d.id,
                                    'name', d.designation_name,
                                    'code', d.designation_code
                                )
                                ORDER BY d.designation_name
                            )
                            FROM designation_master d
                            WHERE d.is_active = TRUE
                        ),
                        '[]'::JSONB
                    ) AS designations,
                    COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', cs.id,
                                    'name', cs.scope_name,
                                    'code', cs.scope_code
                                )
                                ORDER BY cs.scope_name
                            )
                            FROM consultation_scope_master cs
                            WHERE cs.is_active = TRUE
                        ),
                        '[]'::JSONB
                    ) AS "consultationScopes";


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
                        'get_health_institute_master_data',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );

                    RETURN QUERY
                    SELECT
                        'dbError'::VARCHAR,
                        '[]'::JSONB,
                        '[]'::JSONB,
                        '[]'::JSONB;

            END;
            $$;  
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS get_appoint_doctor_master_data();
        `);
  }
}
