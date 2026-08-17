import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompensateDoctorRegistration1784191998504 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION compensate_doctor_registration(
            p_doctor_id INT
        )
        RETURNS VARCHAR(20)
        LANGUAGE plpgsql
        AS $$
        DECLARE
            v_sqlstate TEXT;
            v_message TEXT;
            v_detail TEXT;
        BEGIN

            DELETE
            FROM doctor
            WHERE id = p_doctor_id;

            IF NOT FOUND THEN
                RETURN 'doctorNotFound';
            END IF;

            RETURN 'success';


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
                    'compensate_doctor_registration',
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
      `DROP FUNCTION IF EXISTS compensate_doctor_registration(INT);`,
    );
  }
}
