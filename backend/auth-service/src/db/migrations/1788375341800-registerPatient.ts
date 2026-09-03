import { MigrationInterface, QueryRunner } from 'typeorm';

export class RegisterPatient1788375341800 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION register_patient(
                p_email VARCHAR(255),
                p_mobile VARCHAR(20),
                p_password VARCHAR(255)
            )
            RETURNS TABLE (
                status VARCHAR,
                "patientPrimaryKey" INTEGER,
                "patientId" VARCHAR
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_id BIGINT;
                v_patient_id VARCHAR(20);

                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
            BEGIN

                IF p_email IS NOT NULL
                AND TRIM(p_email) <> ''
                AND EXISTS (
                    SELECT 1
                    FROM patient
                    WHERE email = p_email
                )
                THEN
                    RETURN QUERY
                    SELECT
                        'emailExist'::VARCHAR,
                        0::INTEGER,
                        ''::VARCHAR;

                    RETURN;
                END IF;

                IF p_mobile IS NOT NULL
                AND TRIM(p_mobile) <> ''
                AND EXISTS (
                    SELECT 1
                    FROM patient
                    WHERE mobile = p_mobile
                )
                THEN
                    RETURN QUERY
                    SELECT
                        'mobileExist'::VARCHAR,
                        0::INTEGER,
                        ''::VARCHAR;

                    RETURN;
                END IF;

                INSERT INTO patient (
                    email,
                    mobile,
                    password,
                    created_at
                )
                VALUES (
                    p_email,
                    p_mobile,
                    p_password,
                    NOW()
                )
                RETURNING patient_primary_key INTO v_id;

                v_patient_id :=
                    'AGL-' || 'PAT' || LPAD(v_id::TEXT, 6, '0');

                UPDATE patient
                SET
                    patient_id = v_patient_id,
                    updated_at = NOW()
                WHERE patient_primary_key = v_id;


                RETURN QUERY
                SELECT
                    'SUCCESS'::VARCHAR,
                    v_id::INTEGER,
                    v_patient_id::VARCHAR;


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
                        'create_patient_auth',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );


                    -- Database error response
                    RETURN QUERY
                    SELECT
                        'dbError'::VARCHAR,
                        0::INTEGER,
                        ''::VARCHAR;

            END;
            $$;  
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS register_patient(VARCHAR, VARCHAR, VARCHAR);`,
    );
  }
}
