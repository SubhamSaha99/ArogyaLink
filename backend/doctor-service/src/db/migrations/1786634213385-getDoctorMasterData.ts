import { MigrationInterface, QueryRunner } from 'typeorm';

export class GetDoctorMasterData1786634213385 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION get_doctor_master_data()
        RETURNS TABLE (
            status VARCHAR,
            "registrationCouncils" JSONB,
            states JSONB,
            qualifications JSONB,
            specializations JSONB
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
                    '[]'::JSONB
                ) AS "registrationCouncils",
        
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
                    '[]'::JSONB
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
                    '[]'::JSONB
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
                    '[]'::JSONB
                ) AS specializations;
        
        
        EXCEPTION
            WHEN OTHERS THEN
        
                -- Capture PostgreSQL error
                GET STACKED DIAGNOSTICS
                    v_sqlstate = RETURNED_SQLSTATE,
                    v_message = MESSAGE_TEXT,
                    v_detail = PG_EXCEPTION_DETAIL;
        
                -- Log database exception
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
        
                -- Return DB error response
                RETURN QUERY
                SELECT
                    'dbError'::VARCHAR,
                    '[]'::JSONB,
                    '[]'::JSONB,
                    '[]'::JSONB,
                    '[]'::JSONB;
        
        END;
        $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS get_doctor_master_data();
        `);
  }
}
