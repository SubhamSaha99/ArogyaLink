import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDoctorBasicDetails1784717769032 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE OR REPLACE PROCEDURE update_doctor_basic_details(
                    IN p_doctorId VARCHAR(20),
                    IN p_firstName VARCHAR(255),
                    IN p_middleName VARCHAR(255),
                    IN p_lastName VARCHAR(255),
                    IN p_gender INT,
                    IN p_profileImage VARCHAR(255),
                    OUT p_result VARCHAR(50)
                )
                LANGUAGE plpgsql
                AS $$
                DECLARE
                    v_sqlstate TEXT;
                    v_message TEXT;
                    v_detail TEXT;
                BEGIN
                    p_result := NULL;

                    -- Update doctor profile
                    UPDATE doctor_profile
                    SET
                        first_name = COALESCE(p_firstName, first_name),
                        middle_name = COALESCE(p_middleName, middle_name),
                        last_name = COALESCE(p_lastName, last_name),
                        gender = COALESCE(p_gender, gender),
                        profile_image = COALESCE(p_profileImage, profile_image),
                        updated_at = NOW()
                    WHERE doctor_id = p_doctorId;

                    IF NOT FOUND THEN
                        p_result := 'invalidIdError';
                        RETURN;
                    END IF;

                    p_result := p_doctorId;

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
                            'update_doctor_basic_details',
                            v_sqlstate,
                            v_message,
                            COALESCE(v_detail, ''),
                            NOW()
                        );

                        p_result := 'dbError';
                END;
                $$;
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query( `DROP PROCEDURE IF EXISTS update_doctor_basic_details(VARCHAR, VARCHAR, VARCHAR, VARCHAR, INT, VARCHAR, VARCHAR);`);
    }

}
