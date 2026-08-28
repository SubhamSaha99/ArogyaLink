import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateHealthInstituteProfileDetails1787036868784 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_health_institute_profile_details(
                p_health_institute_profile_id INTEGER,
                p_registration_number VARCHAR(100),
                p_phone VARCHAR(20),
                p_address TEXT,
                p_state_id SMALLINT,
                p_district_id SMALLINT,
                p_pincode VARCHAR(10)
            )
            RETURNS VARCHAR(50)
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
                v_health_institute_id VARCHAR(20);
            BEGIN

                UPDATE health_institute_profile
                SET
                    registration_number = COALESCE(p_registration_number, registration_number),
                    phone = COALESCE(p_phone, phone),
                    address = COALESCE(p_address, address),
                    state_id = COALESCE(p_state_id, state_id),
                    district_id = COALESCE(p_district_id, district_id),
                    pincode = COALESCE(p_pincode, pincode),
                    updated_at = NOW()
                WHERE id = p_health_institute_profile_id

                RETURNING health_institute_id INTO v_health_institute_id;

                -- Doctor not found
                IF v_health_institute_id IS NULL THEN
                    RETURN 'invalidIdError';
                END IF;
                
                RETURN v_health_institute_id;

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
                        'update_health_institute_profile_details',
                        v_sqlstate,
                        v_message,
                        v_detail,
                        NOW()
                    );
                        
                    RETURN 'dbError';
            END;
            $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS update_health_institute_profile_details(INTEGER, VARCHAR, SMALLINT, VARCHAR);
        `);
  }
}
