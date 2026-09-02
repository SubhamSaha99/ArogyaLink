import { MigrationInterface, QueryRunner } from 'typeorm';

export class GetAppointedDoctorDetailsByPrimaryKey1788068432185 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_appointed_doctors_by_primary_key(
                p_doctor_primary_keys INTEGER[]
            )
            RETURNS TABLE (
                status VARCHAR,
                doctors JSONB
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
            BEGIN

                -- Validate input
                IF p_doctor_primary_keys IS NULL OR cardinality(p_doctor_primary_keys) = 0
                THEN
                    RETURN QUERY
                    SELECT
                        'SUCCESS'::VARCHAR,
                        '[]'::JSONB;
                    RETURN;
                END IF;


                RETURN QUERY
                SELECT
                    'SUCCESS'::VARCHAR AS status,
                    COALESCE(
                        jsonb_agg(
                            jsonb_build_object(
                                'firstName', dp.first_name,
                                'middleName', dp.middle_name,
                                'lastName', dp.last_name,
                                'medicalRegistration', pd.medical_registration,
                                'licenseStatus', pd.license_status

                            )
                            ORDER BY dp.created_at DESC, dp.doctor_primary_key
                        ),
                        '[]'::JSONB
                    ) AS doctors
                FROM doctor_profile dp
                LEFT JOIN doctor_professional_details pd ON pd.doctor_primary_key = dp.doctor_primary_key AND pd.license_status = 1
                WHERE dp.doctor_primary_key = ANY(p_doctor_primary_keys);


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
                        'get_appointed_doctors_by_primary_key',
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
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS get_appointed_doctors_by_primary_key(INTEGER[]);
        `);
  }
}
