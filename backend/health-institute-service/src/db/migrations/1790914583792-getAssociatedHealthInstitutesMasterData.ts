import { MigrationInterface, QueryRunner } from "typeorm";

export class GetAssociatedHealthInstitutesMasterData1790914583792 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_associated_health_institutes_master_data(
                p_doctor_primary_key INTEGER
            )
            RETURNS TABLE (
                id INT,
                name VARCHAR,
                code VARCHAR
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
            BEGIN

                RETURN QUERY
                SELECT
                    him.health_institute_primary_key AS id,
					hip.health_institute_name AS name,
                    him.health_institute_id AS code
                FROM health_institute_doctor_mapping him
                LEFT JOIN health_institute_profile hip ON him.health_institute_primary_key = hip.health_institute_primary_key
                WHERE him.doctor_primary_key = p_doctor_primary_key
                AND him.is_active = TRUE;
				


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
                        'get_associated_health_institutes_master_data',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );

                    RETURN QUERY
                    SELECT
                        'dbError'::VARCHAR,
                        '[]'::JSONB;

            END;
            $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
      `DROP FUNCTION IF EXISTS get_associated_health_institutes_master_data(INTEGER);`,
    );
    }

}
