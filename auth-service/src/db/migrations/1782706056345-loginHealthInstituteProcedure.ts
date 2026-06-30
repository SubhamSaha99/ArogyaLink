import { MigrationInterface, QueryRunner } from "typeorm";

export class LoginHealthInstituteProcedure1782706056345 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE OR REPLACE PROCEDURE login_health_institute(
                IN p_healthInstituteId VARCHAR(20),
                IN p_email VARCHAR(255),
                INOUT p_result REFCURSOR
                )
                LANGUAGE plpgsql
                AS $$
                DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
                BEGIN
                    
                IF NOT EXISTS (
                    SELECT 1
                    FROM health_institute
                    WHERE
                        (
                            p_healthInstituteId IS NOT NULL
                            AND TRIM(p_healthInstituteId) <> ''
                            AND health_institute_id = p_healthInstituteId
                        )
                        OR
                        (
                            (p_healthInstituteId IS NULL OR TRIM(p_healthInstituteId) = '')
                            AND email = p_email
                        )
                ) THEN

                    OPEN p_result FOR
                    SELECT
                        'emailNotExist'::VARCHAR AS status,
                        NULL::VARCHAR AS health_institute_id,
                        NULL::VARCHAR AS health_institute_name,
                        NULL::INT AS health_institute_type,
                        NULL::VARCHAR AS email,
                        NULL::VARCHAR AS password;

                    RETURN;
                END IF;

                OPEN p_result FOR
                SELECT
                    'SUCCESS'::VARCHAR AS status,
                    health_institute_id,
                    health_institute_name,
                    health_institute_type,
                    email,
                    password
                FROM health_institute
                WHERE
                    (
                        p_healthInstituteId IS NOT NULL
                        AND TRIM(p_healthInstituteId) <> ''
                        AND health_institute_id = p_healthInstituteId
                    )
                    OR
                    (
                        (p_healthInstituteId IS NULL OR TRIM(p_healthInstituteId) = '')
                        AND email = p_email
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

                    OPEN p_result FOR
                    SELECT
                        'dbError'::VARCHAR AS status,
                        NULL::VARCHAR AS health_institute_id,
                        NULL::VARCHAR AS health_institute_name,
                        NULL::INT AS health_institute_type,
                        NULL::VARCHAR AS email,
                        NULL::VARCHAR AS password;

                END;
                $$;
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query( `DROP PROCEDURE IF EXISTS login_health_institute(VARCHAR, VARCHAR, REFCURSOR);` );
    }

}
