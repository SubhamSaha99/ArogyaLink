import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDoctorProfessionalDetails1785133750759 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE OR REPLACE PROCEDURE update_doctor_professional_details(
                    IN p_doctorId VARCHAR(20),
                    IN p_medicalRegistration VARCHAR(30),
                    IN p_registrationCouncilId SMALLINT,
                    IN p_registrationStateId SMALLINT,
                    IN p_registrationYear SMALLINT,
                    IN p_licenseStatus SMALLINT,
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

                    -- Insert or Update professional details
                    INSERT INTO doctor_professional_details (
                        doctor_id,
                        medical_registration,
                        registration_council_id,
                        registration_state_id,
                        registration_year,
                        license_status,
                        created_at,
                        updated_at
                    )
                    VALUES (
                        p_doctorId,
                        p_medicalRegistration,
                        p_registrationCouncilId,
                        p_registrationStateId,
                        p_registrationYear,
                        p_licenseStatus,
                        NOW(),
                        NOW()
                    )
                    ON CONFLICT (doctor_id)
                    DO UPDATE SET
                        medical_registration = EXCLUDED.medical_registration,
                        registration_council_id = EXCLUDED.registration_council_id,
                        registration_state_id = EXCLUDED.registration_state_id,
                        registration_year = EXCLUDED.registration_year,
                        license_status = EXCLUDED.license_status,
                        updated_at = NOW();

                    p_result := p_doctorId;

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

                        p_result := 'dbError';
                END;
                $$;
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query( `DROP PROCEDURE IF EXISTS update_doctor_professional_details(VARCHAR, VARCHAR, SMALLINT, SMALLINT, SMALLINT, SMALLINT, VARCHAR);`);
    }

}
