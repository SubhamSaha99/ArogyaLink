import { MigrationInterface, QueryRunner } from 'typeorm';

export class GetUnappointedDoctorsList1788338037532 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_unappointed_doctors_list(
                p_offset INTEGER DEFAULT 0,
                p_limit INTEGER DEFAULT 10,
                p_search VARCHAR DEFAULT NULL,
                p_state_id INTEGER DEFAULT NULL,
                p_council_id INTEGER DEFAULT NULL,
                p_appointed_doctor_primary_keys INTEGER[] DEFAULT NULL
            )
            RETURNS TABLE (
                doctors JSONB,
                total BIGINT,
                "resultOffset" INTEGER,
                "resultLimit" INTEGER
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
                v_search TEXT;
            BEGIN

                -- Normalize search
                v_search := NULLIF(BTRIM(p_search), '');

                -- Normalize pagination
                p_offset := GREATEST(COALESCE(p_offset, 0), 0);

                p_limit := LEAST(
                    GREATEST(COALESCE(p_limit, 10), 1),
                    100
                );

                RETURN QUERY

                WITH filtered_doctors AS (
                    SELECT
                        dp.doctor_primary_key,
                        dp.doctor_id,
                        dp.first_name,
                        dp.middle_name,
                        dp.last_name,
                        dp.created_at,

                        pd.medical_registration,

                        pd.registration_council_id,
                        rcm.council_name AS registration_council_name,

                        pd.registration_state_id,
                        sm.state_name AS registration_state_name,

                        pd.license_status

                    FROM doctor_profile dp

                    LEFT JOIN doctor_professional_details pd
                        ON pd.doctor_primary_key = dp.doctor_primary_key
                        AND pd.license_status = 1

                    LEFT JOIN registration_council_master rcm
                        ON rcm.id = pd.registration_council_id

                    LEFT JOIN state_master sm
                        ON sm.id = pd.registration_state_id

                    WHERE
                        (
                            v_search IS NULL
                            OR dp.doctor_id ILIKE '%' || v_search || '%'
                            OR pd.medical_registration ILIKE '%' || v_search || '%'
                        )

                        AND (
                            p_state_id IS NULL
                            OR pd.registration_state_id = p_state_id
                        )

                        AND (
                            p_council_id IS NULL
                            OR pd.registration_council_id = p_council_id
                        )

                        -- Exclude already appointed doctors
                        AND (
                            p_appointed_doctor_primary_keys IS NULL
                            OR cardinality(p_appointed_doctor_primary_keys) = 0
                            OR NOT (
                                dp.doctor_primary_key = ANY(
                                    p_appointed_doctor_primary_keys
                                )
                            )
                        )
                ),

                paginated_doctors AS (
                    SELECT *
                    FROM filtered_doctors
                    ORDER BY created_at DESC, doctor_id
                    LIMIT p_limit
                    OFFSET p_offset
                )

                SELECT

                    COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'doctorPrimaryKey', d.doctor_primary_key,
                                    'doctorId', d.doctor_id,
                                    'firstName', d.first_name,
                                    'middleName', d.middle_name,
                                    'lastName', d.last_name,
                                    'medicalRegistration', d.medical_registration,
                                    'registrationCouncilId', d.registration_council_id,
                                    'registrationCouncilName', d.registration_council_name,
                                    'registrationStateId', d.registration_state_id,
                                    'registrationStateName', d.registration_state_name,
                                    'licenseStatus', d.license_status
                                )
                                ORDER BY
                                    d.created_at DESC,
                                    d.doctor_id
                            )
                            FROM paginated_doctors d
                        ),
                        '[]'::JSONB
                    ) AS doctors,

                    (
                        SELECT COUNT(*)
                        FROM filtered_doctors
                    ) AS total,

                    p_offset AS "resultOffset",

                    p_limit AS "resultLimit";


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
                        'get_doctor_list',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );

                    RAISE;

            END;
            $$;  
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS get_unappointed_doctors_list(INTEGER, INTEGER, VARCHAR, INTEGER, INTEGER, INTEGER[]);
        `);
  }
}
