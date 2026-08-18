import { MigrationInterface, QueryRunner } from "typeorm";

export class GetHealthInstituteDetails1787069148925 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_health_institute_details(
                p_health_institute_id VARCHAR(20)
            )
            RETURNS TABLE (
                status VARCHAR,
                "healthInstituteId" VARCHAR,
                "profileDetails" JSONB
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
            BEGIN

                -- Verify health institute exists
                IF NOT EXISTS (
                    SELECT 1
                    FROM health_institute_profile hip
                    WHERE hip.health_institute_id = p_health_institute_id
                ) THEN

                    RETURN QUERY
                    SELECT
                        'invalidIdError'::VARCHAR,
                        NULL::VARCHAR,
                        NULL::JSONB;

                    RETURN;
                END IF;


                -- Return health institute details
                RETURN QUERY
                SELECT
                    'SUCCESS'::VARCHAR AS status,

                    hip.health_institute_id AS "healthInstituteId",

                    jsonb_build_object(
                        'id', hip.id,
                        'healthInstituteName', hip.health_institute_name,
                        'healthInstituteType', hip.health_institute_type,
                        'registrationNumber', COALESCE(hip.registration_number, ''),
                        'email', hip.email,
                        'phone', COALESCE(hip.phone, ''),
                        'address', COALESCE(hip.address, ''),
                        'stateId', COALESCE(hip.state_id, NULL),
                        'districtId', COALESCE(hip.district_id, NULL),
                        'pincode', COALESCE(hip.pincode, '')
                    ) AS profileDetails

                FROM health_institute_profile hip

                WHERE hip.health_institute_id = p_health_institute_id;


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
                        'get_health_institute_details',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );

                    RETURN QUERY
                    SELECT
                        'dbError'::VARCHAR,
                        NULL::VARCHAR,
                        NULL::JSONB;

            END;
            $$;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS get_health_institute_details(VARCHAR);
        `)
    }

}
