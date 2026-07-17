import { MigrationInterface, QueryRunner } from "typeorm";

export class LoginDoctorProcedure1784310182686 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE OR REPLACE PROCEDURE login_doctor(
                    IN p_email VARCHAR(255),
                    IN p_mobile VARCHAR(20),
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
                    FROM doctor
                    WHERE
                        (
                            p_email IS NOT NULL
                            AND TRIM(p_email) <> ''
                            AND email = p_email
                        )
                        OR
                        (
                            (p_email IS NULL OR TRIM(p_email) = '')
                            AND mobile = p_mobile
                        )
                ) THEN

                    OPEN p_result FOR
                    SELECT
                        'invalidCredential'::VARCHAR AS status,
                        NULL::VARCHAR AS doctor_id,
                        NULL::VARCHAR AS email,
                        NULL::VARCHAR AS mobile,
                        NULL::VARCHAR AS password;

                    RETURN;
                END IF;

                OPEN p_result FOR
                SELECT
                    'SUCCESS'::VARCHAR AS status,
                    doctor_id,
                    email,
                    mobile,
                    password
                FROM doctor
                WHERE
                    (
                        p_email IS NOT NULL
                        AND TRIM(p_email) <> ''
                        AND email = p_email
                    )
                    OR
                    (
                        (p_email IS NULL OR TRIM(p_email) = '')
                        AND mobile = p_mobile
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
                        'login_doctor',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );

                    OPEN p_result FOR
                    SELECT
                        'dbError'::VARCHAR AS status,
                        NULL::VARCHAR AS doctor_id,
                        NULL::VARCHAR AS email,
                        NULL::VARCHAR AS mobile,
                        NULL::VARCHAR AS password;

                END;
                $$;
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP PROCEDURE IF EXISTS login_doctor(VARCHAR, VARCHAR, REFCURSOR);`);
    }

}
