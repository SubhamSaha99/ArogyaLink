import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoginHealthInstituteProcedure1782706056345 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION login_health_institute(
                p_health_institute_id VARCHAR(20),
                p_email VARCHAR(255)
            )
            RETURNS TABLE (
                status VARCHAR,
                "healthInstituteId" VARCHAR,
                "healthInstituteName" VARCHAR,
                "healthInstituteType" INT,
                email VARCHAR,
                password VARCHAR
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
            BEGIN
            
                -- Verify health institute exists
                IF NOT EXISTS (
                    SELECT 1
                    FROM health_institute
                    WHERE
                        (
                            p_health_institute_id IS NOT NULL
                            AND TRIM(p_health_institute_id) <> ''
                            AND health_institute_id = p_health_institute_id
                        )
                        OR
                        (
                            (p_health_institute_id IS NULL OR TRIM(p_health_institute_id) = '')
                            AND email = p_email
                        )
                ) THEN
            
                    RETURN QUERY
                    SELECT
                        'invalidCredential'::VARCHAR,
                        NULL::VARCHAR,
                        NULL::VARCHAR,
                        NULL::INT,
                        NULL::VARCHAR,
                        NULL::VARCHAR;
            
                    RETURN;
                END IF;
            
            
                -- Return health institute details
                RETURN QUERY
                SELECT
                    'SUCCESS'::VARCHAR AS status,
                    hi.health_institute_id AS "healthInstituteId",
                    hi.health_institute_name AS "healthInstituteName",
                    hi.health_institute_type AS "healthInstituteType",
                    hi.email,
                    hi.password
                FROM health_institute hi
                WHERE
                    (
                        p_health_institute_id IS NOT NULL
                        AND TRIM(p_health_institute_id) <> ''
                        AND hi.health_institute_id = p_health_institute_id
                    )
                    OR
                    (
                        (p_health_institute_id IS NULL OR TRIM(p_health_institute_id) = '')
                        AND hi.email = p_email
                    );
            
            
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
                        'login_health_institute',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );
            
                    RETURN QUERY
                    SELECT
                        'dbError'::VARCHAR,
                        NULL::VARCHAR,
                        NULL::VARCHAR,
                        NULL::INT,
                        NULL::VARCHAR,
                        NULL::VARCHAR;
            
            END;
            $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP PROCEDURE IF EXISTS login_health_institute(VARCHAR, VARCHAR, REFCURSOR);`,
    );
  }
}
