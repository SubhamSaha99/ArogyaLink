import { MigrationInterface, QueryRunner } from 'typeorm';

export class GetDoctorMasterData1786634213385 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE PROCEDURE get_doctor_master_data(
                INOUT p_result REFCURSOR
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
            BEGIN

                OPEN p_result FOR
                SELECT
                    'SUCCESS'::VARCHAR AS status,

                    -- Registration Councils
                    COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', rc.id,
                                    'name', rc.council_name,
                                    'code', rc.council_code
                                )
                                ORDER BY rc.council_name
                            )
                            FROM registration_council_master rc
                            WHERE rc.is_active = TRUE
                        ),
                        '[]'::jsonb
                    ) AS registration_councils,

                    -- States
                    COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', s.id,
                                    'name', s.state_name,
                                    'code', s.state_code
                                )
                                ORDER BY s.state_name
                            )
                            FROM state_master s
                            WHERE s.is_active = TRUE
                        ),
                        '[]'::jsonb
                    ) AS states,

                    -- Qualifications
                    COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', q.id,
                                    'name', q.qualification_name,
                                    'code', q.qualification_code
                                )
                                ORDER BY q.qualification_name
                            )
                            FROM qualification_master q
                        ),
                        '[]'::jsonb
                    ) AS qualifications,

                    -- Specializations
                    COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', sp.id,
                                    'name', sp.specialization_name,
                                    'code', sp.specialization_code
                                )
                                ORDER BY sp.specialization_name
                            )
                            FROM specialization_master sp
                        ),
                        '[]'::jsonb
                    ) AS specializations;

            EXCEPTION
                WHEN OTHERS THEN

                    GET STACKED DIAGNOSTICS
                        v_sqlstate = RETURNED_SQLSTATE,
                        v_message = MESSAGE_TEXT,
                        v_detail = PG_EXCEPTION_DETAIL;

                    INSERT INTO db_exception_log
                    (
                        procedure_name,
                        error_code,
                        error_message,
                        error_details,
                        created_at
                    )
                    VALUES
                    (
                        'get_doctor_master_data',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );

                    OPEN p_result FOR
                    SELECT
                        'dbError'::VARCHAR AS status,
                        '[]'::jsonb AS registration_councils,
                        '[]'::jsonb AS states,
                        '[]'::jsonb AS qualifications,
                        '[]'::jsonb AS specializations;

            END;
            $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP PROCEDURE IF EXISTS get_doctor_master_data(REFCOURSOR);
        `);
  }
}
