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
                            'middleName', COALESCE(dp.middle_name, null),
                            'lastName', dp.last_name,
                            'gender', COALESCE(dp.gender, null),
                            'profileImage', COALESCE(dp.profile_image, null)
                        ) AS profile_details,

                        jsonb_build_object(
                            'doctorProfessionalDetailsId', COALESCE(pd.id, null),
                            'medicalRegistration', COALESCE(pd.medical_registration, null),
                            'registrationCouncilId', COALESCE(pd.registration_council_id, null),
                            'registrationCouncilName', COALESCE(rcm.council_name, null),
                            'registrationStateId', COALESCE(pd.registration_state_id, null),
                            'registrationStateName', COALESCE(sm.state_name, null),
                            'registrationYear', COALESCE(pd.registration_year, null),
                            'licenseStatus', COALESCE(pd.license_status, null)
                        ) AS professional_details,

                        COALESCE(
                            (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        'doctorQualificationId', COALESCE(dq.id, null),
                                        'qualificationId', COALESCE(dq.qualification_id, null),
                                        'qualificationName', COALESCE(qm.qualification_name, null),
                                        'specializationId', COALESCE(dq.specialization_id, null),
                                        'specializationName', COALESCE(spm.specialization_name, null),
                                        'institutionName', COALESCE(dq.institution_name, null),
                                        'universityName', COALESCE(dq.university_name, null),
                                        'yearOfCompletion', COALESCE(dq.year_of_completion, null)
                                    )
                                    ORDER BY dq.year_of_completion DESC
                                )
                                FROM doctor_qualifications dq
                                LEFT JOIN qualification_master qm
                                    ON qm.id = dq.qualification_id
                                LEFT JOIN specialization_master spm
                                    ON spm.id = dq.specialization_id
                                WHERE dq.doctor_id = dp.doctor_id
                            ),
                            '[]'::jsonb
                        ) AS qualification_details

                    FROM doctor_profile dp

                    LEFT JOIN doctor_professional_details pd
                        ON dp.doctor_id = pd.doctor_id

                    LEFT JOIN registration_council_master rcm
                        ON rcm.id = pd.registration_council_id

                    LEFT JOIN state_master sm
                        ON sm.id = pd.registration_state_id

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
