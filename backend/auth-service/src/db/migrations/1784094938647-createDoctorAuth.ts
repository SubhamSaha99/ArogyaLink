import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDoctorAuth1784094938647 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION create_doctor_auth(
            p_email VARCHAR(255),
            p_mobile VARCHAR(20),
            p_password VARCHAR(255)
        )
        RETURNS TABLE (
            status VARCHAR,
            "doctorPrimaryKey" INTEGER,
            "doctorId" VARCHAR
        )
        LANGUAGE plpgsql
        AS $$
        DECLARE
            v_id BIGINT;
            v_doctor_id VARCHAR(20);

            v_sqlstate TEXT;
            v_message TEXT;
            v_detail TEXT;
        BEGIN

            -- Check if email already exists
            IF p_email IS NOT NULL
            AND TRIM(p_email) <> ''
            AND EXISTS (
                SELECT 1
                FROM doctor
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


            -- Check if mobile already exists
            IF p_mobile IS NOT NULL
            AND TRIM(p_mobile) <> ''
            AND EXISTS (
                SELECT 1
                FROM doctor
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


            -- Insert doctor authentication record
            INSERT INTO doctor (
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
            RETURNING id INTO v_id;


            -- Generate Doctor ID
            v_doctor_id :=
                'AGL-' || 'DOC' || LPAD(v_id::TEXT, 6, '0');


            -- Update Doctor ID
            UPDATE doctor
            SET
                doctor_id = v_doctor_id,
                updated_at = NOW()
            WHERE id = v_id;


            -- Success response
            RETURN QUERY
            SELECT
                'SUCCESS'::VARCHAR,
                v_id::INTEGER,
                v_doctor_id::VARCHAR;


        EXCEPTION
            WHEN OTHERS THEN

                -- Capture PostgreSQL error
                GET STACKED DIAGNOSTICS
                    v_sqlstate = RETURNED_SQLSTATE,
                    v_message = MESSAGE_TEXT,
                    v_detail = PG_EXCEPTION_DETAIL;


                -- Log database exception
                INSERT INTO db_exception_log (
                    procedure_name,
                    error_code,
                    error_message,
                    error_details,
                    created_at
                )
                VALUES (
                    'create_doctor_auth',
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
      `DROP FUNCTION IF EXISTS create_doctor_auth(VARCHAR, VARCHAR, VARCHAR);`,
    );
  }
}
