import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDoctorProfile1784178631611 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION create_doctor_profile(
                p_doctor_primary_key INTEGER,
                p_doctor_id VARCHAR(20),
                p_email VARCHAR(255),
                p_mobile VARCHAR(20),
                p_first_name VARCHAR(255),
                p_middle_name VARCHAR(255),
                p_last_name VARCHAR(255)
            )
            RETURNS VARCHAR(50)
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
                v_doctor_id VARCHAR(20);
            BEGIN
            
                INSERT INTO doctor_profile (
                    doctor_primary_key,
                    doctor_id,
                    email,
                    mobile,
                    first_name,
                    middle_name,
                    last_name,
                    created_at
                )
                VALUES (
                    p_doctor_primary_key,
                    p_doctor_id,
                    p_email,
                    p_mobile,
                    p_first_name,
                    p_middle_name,
                    p_last_name,
                    NOW()
                )
                RETURNING doctor_id INTO v_doctor_id;
            
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
                        'create_doctor_profile',
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
      `DROP FUNCTION IF EXISTS create_doctor_profile(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR);`,
    );
  }
}
