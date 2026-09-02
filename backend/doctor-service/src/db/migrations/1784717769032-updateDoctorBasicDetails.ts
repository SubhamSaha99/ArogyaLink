import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDoctorBasicDetails1784717769032 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                CREATE OR REPLACE FUNCTION update_doctor_basic_details(
                    p_doctor_profile_id INTEGER,
                    p_first_name VARCHAR(255),
                    p_middle_name VARCHAR(255),
                    p_last_name VARCHAR(255),
                    p_gender INTEGER,
                    p_profile_image VARCHAR(255)
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

                    UPDATE doctor_profile
                    SET
                        first_name = COALESCE(p_first_name, first_name),
                        middle_name = COALESCE(p_middle_name, middle_name),
                        last_name = COALESCE(p_last_name, last_name),
                        gender = COALESCE(p_gender, gender),
                        profile_image = COALESCE(p_profile_image, profile_image),
                        updated_at = NOW()
                    WHERE id = p_doctor_profile_id

                    RETURNING doctor_id INTO v_doctor_id;

                    -- Doctor not found
                    IF v_doctor_id IS NULL THEN
                        RETURN 'invalidIdError';
                    END IF;

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
                            'update_doctor_basic_details',
                            v_sqlstate,
                            v_message,
                            v_detail,
                            NOW()
                        );

                        RETURN 'dbError';

                END;
                $$;
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_doctor_basic_details(INTEGER, VARCHAR, VARCHAR, VARCHAR, INTEGER, VARCHAR);`,
    );
  }
}
