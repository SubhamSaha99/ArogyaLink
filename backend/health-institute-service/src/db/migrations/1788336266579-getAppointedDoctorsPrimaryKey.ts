import { MigrationInterface, QueryRunner } from 'typeorm';

export class GetAppointedDoctorsPrimaryKey1788336266579 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_appointed_doctors_primary_keys(
                p_health_institute_primary_key INTEGER
            )
            RETURNS TABLE (
                status VARCHAR,
                "doctorPrimaryKeys" INTEGER[]
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
                    'SUCCESS'::VARCHAR AS status,
                    COALESCE(
                        ARRAY_AGG(him.doctor_primary_key ORDER BY him.doctor_primary_key),
                        ARRAY[]::INTEGER[]
                    ) AS "doctorPrimaryKeys"
                FROM health_institute_doctor_mapping him
                WHERE him.health_institute_primary_key = p_health_institute_primary_key
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
                        'get_appointed_doctor_primary_keys',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );

                    RETURN QUERY
                    SELECT
                        'dbError'::VARCHAR,
                        ARRAY[]::INTEGER[];

            END;
            $$;  
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS get_appointed_doctors_primary_keys(INTEGER);`,
    );
  }
}
