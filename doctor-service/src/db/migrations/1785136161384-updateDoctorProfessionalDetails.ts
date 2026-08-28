import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDoctorProfessionalDetails1785133750759 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_doctor_professional_details(
                p_doctor_professional_details_id INTEGER,
                p_doctor_primary_key INTEGER,
                p_doctor_id VARCHAR(20),
                p_medical_registration VARCHAR(30),
                p_registration_council_id SMALLINT,
                p_registration_state_id SMALLINT,
                p_registration_year SMALLINT,
                p_license_status SMALLINT
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

                -- Verify doctor exists
                IF NOT EXISTS (
                    SELECT 1
                    FROM doctor_profile
                    WHERE doctor_primary_key = p_doctor_primary_key
                    AND doctor_id = p_doctor_id
                ) THEN
                    RETURN 'invalidIdError';
                END IF;


                -- UPDATE existing professional details
                IF p_doctor_professional_details_id IS NOT NULL THEN

                    UPDATE doctor_professional_details
                    SET
                        medical_registration = COALESCE(p_medical_registration, medical_registration),
                        registration_council_id = COALESCE(p_registration_council_id, registration_council_id),
                        registration_state_id = COALESCE( p_registration_state_id, registration_state_id),
                        registration_year = COALESCE( p_registration_year, registration_year),
                        license_status = COALESCE( p_license_status, license_status),
                        updated_at = NOW()
                    WHERE id = p_doctor_professional_details_id
                    RETURNING doctor_id INTO v_doctor_id;


                    -- Professional details record not found
                    IF v_doctor_id IS NULL THEN
                        RETURN 'invalidIdError';
                    END IF;

                    RETURN v_doctor_id;

                END IF;


                -- INSERT new professional details
                INSERT INTO doctor_professional_details (
                    doctor_primary_key,
                    doctor_id,
                    medical_registration,
                    registration_council_id,
                    registration_state_id,
                    registration_year,
                    license_status,
                    created_at
                )
                VALUES (
                    p_doctor_primary_key,
                    p_doctor_id,
                    p_medical_registration,
                    p_registration_council_id,
                    p_registration_state_id,
                    p_registration_year,
                    p_license_status,
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
                        'update_doctor_professional_details',
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
      `DROP FUNCTION IF EXISTS update_doctor_professional_details(INTEGER, INTEGER, VARCHAR, VARCHAR, SMALLINT, SMALLINT, SMALLINT, SMALLINT);`,
    );
  }
}
