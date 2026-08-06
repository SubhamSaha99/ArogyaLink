import { MigrationInterface, QueryRunner } from "typeorm";

export class GetDoctorDetails1786030102350 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE OR REPLACE PROCEDURE get_doctor_details(
                    IN p_doctorId VARCHAR(20),
                    INOUT p_result REFCURSOR
                )
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
                        WHERE doctor_id = p_doctorId
                    ) THEN

                        OPEN p_result FOR
                        SELECT
                            'invalidIdError'::VARCHAR AS status,
                            NULL::VARCHAR AS doctor_id,
                            NULL::JSONB AS profile_details,
                            NULL::JSONB AS professional_details,
                            NULL::JSONB AS qualification_details;

                        RETURN;
                    END IF;

                    OPEN p_result FOR
                    SELECT
                        'SUCCESS'::VARCHAR AS status,

                        dp.doctor_id,

                        jsonb_build_object(
                            'doctorProfileId', dp.id,
                            'email', dp.email,
                            'mobile', dp.mobile,
                            'firstName', dp.first_name,
                            'middleName', dp.middle_name,
                            'lastName', dp.last_name,
                            'gender', dp.gender,
                            'profileImage', dp.profile_image
                        ) AS profile_details,

                        jsonb_build_object(
                            'doctorProfessionalDetailsId', pd.id,
                            'medicalRegistration', pd.medical_registration,
                            'registrationCouncilId', pd.registration_council_id,
                            'registrationStateId', pd.registration_state_id,
                            'registrationYear', pd.registration_year,
                            'licenseStatus', pd.license_status
                        ) AS professional_details,

                        COALESCE(
                            (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        'doctorQualificationId', dq.id,
                                        'qualificationId', dq.qualification_id,
                                        'specializationId', dq.specialization_id,
                                        'institutionName', dq.institution_name,
                                        'universityName', dq.university_name,
                                        'yearOfCompletion', dq.year_of_completion
                                    )
                                    ORDER BY dq.year_of_completion
                                )
                                FROM doctor_qualifications dq
                                WHERE dq.doctor_id = dp.doctor_id
                            ),
                            '[]'::jsonb
                        ) AS qualification_details

                    FROM doctor_profile dp
                    LEFT JOIN doctor_professional_details pd
                        ON dp.doctor_id = pd.doctor_id
                    WHERE dp.doctor_id = p_doctorId;

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
                            'get_doctor_details',
                            v_sqlstate,
                            v_message,
                            COALESCE(v_detail, ''),
                            NOW()
                        );

                        OPEN p_result FOR
                        SELECT
                            'dbError'::VARCHAR AS status,
                            NULL::VARCHAR AS doctor_id,
                            NULL::JSONB AS profile_details,
                            NULL::JSONB AS professional_details,
                            NULL::JSONB AS qualification_details;

                END;
                $$;
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`DROP PROCEDURE IF EXISTS get_doctor_details(VARCHAR, REFCURSOR);`);
    }

}
