import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDoctorAuth1784094938647 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION create_doctor_auth(
            p_email VARCHAR(255),
            p_mobile VARCHAR(20),
            p_password VARCHAR(255)
        )
        RETURNS VARCHAR(50)
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
                RETURN 'emailExist';
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
                RETURN 'mobileExist';
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
            v_doctor_id := 'DOC' || LPAD(v_id::TEXT, 6, '0');


            -- Update Doctor ID
            UPDATE doctor
            SET
                doctor_id = v_doctor_id,
                updated_at = NOW()
            WHERE id = v_id;


            -- Return generated Doctor ID
            RETURN v_doctor_id;


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
                    'create_doctor_auth',
                    v_sqlstate,
                    v_message,
                    COALESCE(v_detail, ''),
                    NOW()
                );

                RETURN 'dbError';

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
