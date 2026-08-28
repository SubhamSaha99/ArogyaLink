import { MigrationInterface, QueryRunner } from 'typeorm';

export class GetDoctorDetails1786030102350 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION get_doctor_details(
            p_doctor_primary_key INTEGER
        )
        RETURNS TABLE (
            status VARCHAR,
            "doctorPrimaryKey" INTEGER,
            "doctorId" VARCHAR,
            "profileDetails" JSONB,
            "professionalDetails" JSONB,
            "qualificationDetails" JSONB
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
                FROM doctor_profile dp
                WHERE dp.doctor_primary_key = p_doctor_primary_key
            ) THEN
        
                RETURN QUERY
                SELECT
                    'invalidIdError'::VARCHAR,
                    NULL:: INTEGER,
                    NULL::VARCHAR,
                    NULL::JSONB,
                    NULL::JSONB,
                    NULL::JSONB;
        
                RETURN;
            END IF;
        
        
            -- Return doctor details
            RETURN QUERY
            SELECT
                'SUCCESS'::VARCHAR AS status,
                dp.doctor_primary_key AS doctorPrimaryKey,
                dp.doctor_id::VARCHAR AS doctorId,
                jsonb_build_object(
                    'doctorProfileId', dp.id,
                    'email', dp.email,
                    'mobile', dp.mobile,
                    'firstName', dp.first_name,
                    'middleName', COALESCE(dp.middle_name, ''),
                    'lastName', dp.last_name,
                    'gender', COALESCE(dp.gender, NULL),
                    'profileImage', COALESCE(dp.profile_image, '')
                ) AS "profileDetails",
        
                jsonb_build_object(
                    'doctorProfessionalDetailsId', COALESCE(pd.id, NULL),
                    'medicalRegistration', COALESCE(pd.medical_registration, NULL),
                    'registrationCouncilId', COALESCE(pd.registration_council_id, NULL),
                    'registrationCouncilName', COALESCE(rcm.council_name, NULL),
                    'registrationStateId', COALESCE(pd.registration_state_id, NULL),
                    'registrationStateName', COALESCE(sm.state_name, NULL),
                    'registrationYear', COALESCE(pd.registration_year, NULL),
                    'licenseStatus', COALESCE(pd.license_status, NULL)
                ) AS "professionalDetails",
        
                COALESCE(
                    (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'doctorQualificationId', dq.id,
                                'qualificationId', dq.qualification_id,
                                'qualificationName', qm.qualification_name,
                                'specializationId', COALESCE(dq.specialization_id, NULL),
                                'specializationName', COALESCE(spm.specialization_name, ''),
                                'institutionName', dq.institution_name,
                                'universityName', dq.university_name,
                                'yearOfCompletion', dq.year_of_completion
                            )
                            ORDER BY dq.year_of_completion DESC
                        )
                        FROM doctor_qualifications dq
                        LEFT JOIN qualification_master qm ON qm.id = dq.qualification_id
                        LEFT JOIN specialization_master spm ON spm.id = dq.specialization_id
                        WHERE dq.doctor_primary_key = dp.doctor_primary_key
                    ),
                    '[]'::JSONB
                ) AS "qualificationDetails"
            FROM doctor_profile dp
            LEFT JOIN doctor_professional_details pd ON dp.doctor_primary_key = pd.doctor_primary_key
            LEFT JOIN registration_council_master rcm ON rcm.id = pd.registration_council_id
            LEFT JOIN state_master sm ON sm.id = pd.registration_state_id
            WHERE dp.doctor_primary_key = p_doctor_primary_key;
        
        
        EXCEPTION
            WHEN OTHERS THEN
        
                -- Capture PostgreSQL error
                GET STACKED DIAGNOSTICS
                    v_sqlstate = RETURNED_SQLSTATE,
                    v_message = MESSAGE_TEXT,
                    v_detail = PG_EXCEPTION_DETAIL;
        
                -- Log database exception
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
        
                -- Return DB error response
                RETURN QUERY
                SELECT
                    'dbError'::VARCHAR,
                    NULL::INTEGER,
                    NULL::VARCHAR,
                    NULL::JSONB,
                    NULL::JSONB,
                    NULL::JSONB;
        
        END;
        $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS get_doctor_details(INTEGER);`,
    );
  }
}
