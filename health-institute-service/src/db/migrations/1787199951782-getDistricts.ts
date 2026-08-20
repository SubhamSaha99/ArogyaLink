import { MigrationInterface, QueryRunner } from "typeorm";

export class GetDistricts1787199951782 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_districts(
                p_state_id INT
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
                    d.id,
                    d.district_name AS name,
                    d.district_code AS code
                FROM district_master d
                WHERE d.state_id = p_state_id
                AND d.is_active = TRUE
                ORDER BY d.id ASC;


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
                        'get_districts',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );

                    RETURN;

            END;
            $$;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            DROP FUNCTION IF EXISTS get_districts(SMALLINT);
        `)
    }

}
