import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoginDoctorProcedure1784310182686 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION login_doctor(
            p_email VARCHAR(255),
            p_mobile VARCHAR(20)
        )
        RETURNS TABLE (
            status VARCHAR,
            "doctorId" VARCHAR,
            email VARCHAR,
            mobile VARCHAR,
            password VARCHAR
        )
        LANGUAGE plpgsql
        AS $$
        DECLARE
            v_sqlstate TEXT;
            v_message TEXT;
            v_detail TEXT;
        BEGIN
        
            -- Verify doctor exists
            IF NOT EXISTS (
                SELECT 1
                FROM doctor d
                WHERE
                    (
                        p_email IS NOT NULL
                        AND TRIM(p_email) <> ''
                        AND d.email = p_email
                    )
                    OR
                    (
                        (p_email IS NULL OR TRIM(p_email) = '')
                        AND d.mobile = p_mobile
                    )
            ) THEN
        
                RETURN QUERY
                SELECT
                    'invalidCredential'::VARCHAR,
                    NULL::VARCHAR,
                    NULL::VARCHAR,
                    NULL::VARCHAR,
                    NULL::VARCHAR;
        
                RETURN;
            END IF;
        
        
            -- Return doctor details
            RETURN QUERY
            SELECT
                'SUCCESS'::VARCHAR AS status,
                d.doctor_id AS "doctorId",
                d.email,
                d.mobile,
                d.password
            FROM doctor d
            WHERE
                (
                    p_email IS NOT NULL
                    AND TRIM(p_email) <> ''
                    AND d.email = p_email
                )
                OR
                (
                    (p_email IS NULL OR TRIM(p_email) = '')
                    AND d.mobile = p_mobile
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
        
                RETURN QUERY
                SELECT
                    'dbError'::VARCHAR,
                    NULL::VARCHAR,
                    NULL::VARCHAR,
                    NULL::VARCHAR,
                    NULL::VARCHAR;
        
        END;
        $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS login_doctor(VARCHAR, VARCHAR);`,
    );
  }
}
