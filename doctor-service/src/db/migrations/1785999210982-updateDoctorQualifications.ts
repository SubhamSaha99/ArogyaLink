import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDoctorQualifications1785999210982 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                CREATE OR REPLACE PROCEDURE update_doctor_qualifications(
                    IN p_doctorId VARCHAR(20),
                    IN p_qualifications JSONB,
                    OUT p_result VARCHAR(50)
                )
                LANGUAGE plpgsql
                AS $$
                DECLARE
                    v_sqlstate TEXT;
                    v_message TEXT;
                    v_detail TEXT;
                BEGIN
                    p_result := NULL;

                    -- Verify doctor exists
                    IF NOT EXISTS (
                        SELECT 1
                        FROM doctor_profile
                        WHERE doctor_id = p_doctorId
                    ) THEN
                        p_result := 'invalidIdError';
                        RETURN;
                    END IF;

                    -- Remove existing qualifications
                    DELETE
                    FROM doctor_qualifications
                    WHERE doctor_id = p_doctorId;

                    -- Bulk Insert qualifications
                    INSERT INTO doctor_qualifications
                    (
                        doctor_id,
                        qualification_id,
                        specialization_id,
                        institution_name,
                        university_name,
                        year_of_completion,
                        created_at
                    )
                    SELECT
                        p_doctorId,
                        qualification_id,
                        specialization_id,
                        institution_name,
                        university_name,
                        year_of_completion,
                        NOW()
                    FROM jsonb_to_recordset(p_qualifications)
                    AS qualification
                    (
                        qualification_id INT,
                        specialization_id INT,
                        institution_name VARCHAR(200),
                        university_name VARCHAR(200),
                        year_of_completion SMALLINT
                    );

                    p_result := p_doctorId;

                EXCEPTION
                    WHEN OTHERS THEN
                        GET STACKED DIAGNOSTICS
                            v_sqlstate = RETURNED_SQLSTATE,
                            v_message = MESSAGE_TEXT,
                            v_detail = PG_EXCEPTION_DETAIL;

                        INSERT INTO db_exception_log
                        (
                            procedure_name,
                            error_code,
                            error_message,
                            error_details,
                            created_at
                        )
                        VALUES
                        (
                            'update_doctor_qualifications',
                            v_sqlstate,
                            v_message,
                            COALESCE(v_detail, ''),
                            NOW()
                        );

                        p_result := 'dbError';
                END;
                $$;
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP PROCEDURE IF EXISTS update_doctor_qualifications(VARCHAR, JSONB, VARCHAR);`,
    );
  }
}
