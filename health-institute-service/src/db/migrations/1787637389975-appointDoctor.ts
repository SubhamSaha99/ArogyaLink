import { MigrationInterface, QueryRunner } from "typeorm";

export class AppointDoctor1787637389975 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION appoint_doctor(
                p_health_institute_primary_key INTEGER,
                p_health_institute_id VARCHAR(255),
                p_doctor_primary_key INTEGER,
                p_doctor_id VARCHAR(20),
                p_department_id INTEGER,
                p_designation_id INTEGER,
                p_joining_date DATE,
                p_consultation_scope_id INTEGER,
                p_affiliation_notes TEXT DEFAULT NULL
            )
            RETURNS VARCHAR(50)
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
                v_mapping_id INTEGER;
            BEGIN

                -- Check duplicate doctor mapping
                IF EXISTS (
                    SELECT 1
                    FROM health_institute_doctor_mapping
                    WHERE health_institute_primary_key = p_health_institute_primary_key
                    AND doctor_primary_key = p_doctor_primary_key
                ) THEN
                    RETURN 'doctorAlreadyMapped';
                END IF;


                -- Insert doctor mapping
                INSERT INTO health_institute_doctor_mapping (
                    health_institute_primary_key,
                    health_institute_id,
                    doctor_primary_key,
                    doctor_id,
                    department_id,
                    designation_id,
                    joining_date,
                    consultation_scope_id,
                    affiliation_notes,
                    is_active,
                    created_at
                )
                VALUES (
                    p_health_institute_primary_key,
                    p_health_institute_id,
                    p_doctor_primary_key,
                    p_doctor_id,
                    p_department_id,
                    p_designation_id,
                    p_joining_date,
                    p_consultation_scope_id,
                    p_affiliation_notes,
                    TRUE,
                    NOW()
                )
                RETURNING id INTO v_mapping_id;


                RETURN v_mapping_id::VARCHAR;


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
                        'appoint_doctor',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );

                    RETURN 'dbError';

            END;
            $$;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS appoint_doctor(INTEGER, VARCHAR, INTEGER, VARCHAR, INTEGER, INTEGER, DATE, INTEGER, TEXT);
        `);
    }

}
