import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoginPatient1788501825533 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION login_patient(
            p_email VARCHAR(255),
            p_mobile VARCHAR(20)
        )
        RETURNS TABLE (
            status VARCHAR,
            "patientPrimaryKey" INTEGER,
            "patientId" VARCHAR,
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
        
            -- Verify patient exists
            IF NOT EXISTS (
                SELECT 1
                FROM patient p
                WHERE
                    (
                        p_email IS NOT NULL
                        AND TRIM(p_email) <> ''
                        AND p.email = p_email
                    )
                    OR
                    (
                        (p_email IS NULL OR TRIM(p_email) = '')
                        AND p.mobile = p_mobile
                    )
            ) THEN
        
                RETURN QUERY
                SELECT
                    'invalidCredential'::VARCHAR,
                    NULL:: INTEGER,
                    NULL::VARCHAR,
                    NULL::VARCHAR,
                    NULL::VARCHAR,
                    NULL::VARCHAR;
        
                RETURN;
            END IF;
        
        
            -- Return patient details
            RETURN QUERY
            SELECT
                'SUCCESS'::VARCHAR AS status,
                p.id AS "patientPrimaryKey",
                p.patient_id AS "patientId",
                p.email,
                p.mobile,
                p.password
            FROM patient p
            WHERE
                (
                    p_email IS NOT NULL
                    AND TRIM(p_email) <> ''
                    AND p.email = p_email
                )
                OR
                (
                    (p_email IS NULL OR TRIM(p_email) = '')
                    AND p.mobile = p_mobile
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
                    'login_patient',
                    v_sqlstate,
                    v_message,
                    COALESCE(v_detail, ''),
                    NOW()
                );
        
                RETURN QUERY
                SELECT
                    'dbError'::VARCHAR,
                    NULL:: INTEGER,
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
      `DROP FUNCTION IF EXISTS login_patient(VARCHAR, VARCHAR);`,
    );
  }
}
