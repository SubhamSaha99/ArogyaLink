import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDoctorProfile1784178631611 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE OR REPLACE PROCEDURE create_doctor_profile(
					IN p_doctorId VARCHAR(20),
                    IN p_email VARCHAR(255),
                    IN p_mobile VARCHAR(20),
                    IN p_firstName VARCHAR(255),
                    IN p_middleName VARCHAR(255),
                    IN p_lastName VARCHAR(255),
                    OUT p_result VARCHAR(50)
                )
                LANGUAGE plpgsql
                AS $$
                DECLARE
                    v_id BIGINT;
                    v_sqlstate TEXT;
                    v_message TEXT;
                    v_detail TEXT;
                BEGIN
                    -- Default value
                    p_result := NULL;
                
                    -- Insert record
                    INSERT INTO doctor_profile (
                        doctor_id,
						email,
                        mobile,
						first_name,
						middle_name,
						last_name,
                        created_at
                    )
                    VALUES (
						p_doctorId,
                        p_email,
                        p_mobile,
                        p_firstName,
						p_middleName,
						p_lastName,
                        NOW()
                    );
                    
                    p_result := p_doctorId;
                EXCEPTION
                    WHEN OTHERS THEN
                        GET STACKED DIAGNOSTICS
                            v_sqlstate = RETURNED_SQLSTATE,
                            v_message  = MESSAGE_TEXT,
                            v_detail   = PG_EXCEPTION_DETAIL;
                        -- Adjust these column names to match your table
                        INSERT INTO db_exception_log (
                            procedure_name,
                            error_code,
                            error_message,
                            error_details,
                            created_at
                        )
                        VALUES (
                            'create_doctor_profile',
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
        await queryRunner.query( `DROP PROCEDURE IF EXISTS create_doctor_profile(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR);` );
    }

}
