import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDoctorAuth1784094938647 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                    CREATE OR REPLACE PROCEDURE create_doctor_auth(
                        IN p_email VARCHAR(255),
                        IN p_mobile VARCHAR(20),
                        IN p_password VARCHAR(255),
                        OUT p_result VARCHAR(50)
                    )
                    LANGUAGE plpgsql
                    AS $$
                    DECLARE
                        v_id BIGINT;
                        v_doctorId VARCHAR(20);
                        v_prefix CHAR(1);
                        v_sqlstate TEXT;
                        v_message TEXT;
                        v_detail TEXT;
                    BEGIN

                        -- Default value
                        p_result := NULL;

                        -- Check if email already exists
                        IF EXISTS (
                            SELECT 1
                            FROM doctor
                            WHERE 
                            (
                                p_email IS NOT NULL AND TRIM(p_email) <> '' AND email = p_email
                            )
                        ) THEN
                            p_result := 'emailExist';
                            RETURN;
                        END IF;

                        -- Check if mobile already exists
                        IF EXISTS (
                            SELECT 1
                            FROM doctor
                            WHERE 
                            (
                                p_mobile IS NOT NULL AND TRIM(p_mobile) <> '' AND mobile = p_mobile
                            )
                        ) THEN
                            p_result := 'mobileExist';
                            RETURN;
                        END IF;


                        -- Insert record
                        INSERT INTO doctor (
                            email,
                            mobile,
                            password,
                            created_at
                        )
                        VALUES (
                            p_email,
                            p_mobile,
                            p_password,
                            NOW()
                        )
                        RETURNING id INTO v_id;

                        -- Generate Doctor ID
                        v_doctorId := 'DOC' || LPAD(v_id::TEXT, 6, '0');

                        -- Update User ID
                        UPDATE doctor
                        SET
                            doctor_id = v_doctorId,
                            updated_at = NOW()
                        WHERE id = v_id;

                        -- Return generated userId
                        p_result := v_doctorId;

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
                                'create_doctor_auth',
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
        await queryRunner.query( `DROP PROCEDURE IF EXISTS create_doctor_auth(VARCHAR, VARCHAR, VARCHAR, VARCHAR);` );
    }

}
