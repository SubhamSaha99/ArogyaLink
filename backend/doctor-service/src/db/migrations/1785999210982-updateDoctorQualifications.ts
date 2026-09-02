import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDoctorQualifications1785999210982 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_doctor_qualifications(
                p_doctor_primary_key INTEGER,
                p_doctor_id VARCHAR(20),
                p_qualifications JSONB
            )
            RETURNS VARCHAR(50)
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
                    FROM doctor_profile
                    WHERE doctor_primary_key = p_doctor_primary_key
                    AND doctor_id = p_doctor_id
                ) THEN
                    RETURN 'invalidIdError';
                END IF;


                -- Update existing qualifications
                UPDATE doctor_qualifications dq
                SET
                    qualification_id = q."qualificationId",
                    specialization_id = q."specializationId",
                    institution_name = q."institutionName",
                    university_name = q."universityName",
                    year_of_completion = q."yearOfCompletion",
                    updated_at = NOW()
                FROM jsonb_to_recordset(
                    COALESCE(p_qualifications, '[]'::JSONB)
                ) AS q (
                    "doctorQualificationId" INTEGER,
                    "qualificationId" INTEGER,
                    "specializationId" INTEGER,
                    "institutionName" VARCHAR(200),
                    "universityName" VARCHAR(200),
                    "yearOfCompletion" SMALLINT
                )
                WHERE q."doctorQualificationId" IS NOT NULL
                AND dq.id = q."doctorQualificationId"
                AND dq.doctor_primary_key = p_doctor_primary_key
                AND dq.doctor_id = p_doctor_id;


                -- Insert new qualifications
                INSERT INTO doctor_qualifications (
                    doctor_primary_key,
                    doctor_id,
                    qualification_id,
                    specialization_id,
                    institution_name,
                    university_name,
                    year_of_completion,
                    created_at
                )
                SELECT
                    p_doctor_primary_key,
                    p_doctor_id,
                    q."qualificationId",
                    q."specializationId",
                    q."institutionName",
                    q."universityName",
                    q."yearOfCompletion",
                    NOW()
                FROM jsonb_to_recordset(
                    COALESCE(p_qualifications, '[]'::JSONB)
                ) AS q (
                    "doctorQualificationId" INTEGER,
                    "qualificationId" INTEGER,
                    "specializationId" INTEGER,
                    "institutionName" VARCHAR(200),
                    "universityName" VARCHAR(200),
                    "yearOfCompletion" SMALLINT
                )
                WHERE q."doctorQualificationId" IS NULL;


                RETURN p_doctor_id;


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
                        'update_doctor_qualifications',
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
      `DROP FUNCTION IF EXISTS update_doctor_qualifications(INTEGER, VARCHAR, JSONB);`,
    );
  }
}
