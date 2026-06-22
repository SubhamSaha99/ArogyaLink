import { MigrationInterface, QueryRunner } from "typeorm";

export class RegisterHealthInstituteProcedure1782030746336 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE OR REPLACE PROCEDURE register_health_institute(
                    IN p_healthInstituteType INT,
                    IN p_email VARCHAR(255),
                    IN p_healthInstituteName VARCHAR(255),
                    IN p_password VARCHAR(255),
                    OUT p_result VARCHAR(50)
                )
                LANGUAGE plpgsql
                AS $$
                DECLARE
                    v_id BIGINT;
                    v_userId VARCHAR(20);
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
                        FROM health_institute
                        WHERE email = p_email
                    ) THEN
                        p_result := 'emailExist';
                        RETURN;
                    END IF;

                    -- Determine prefix
                    v_prefix := CASE p_healthInstituteType
                                    WHEN 1 THEN 'H'
                                    WHEN 2 THEN 'N'
                                    WHEN 3 THEN 'D'
                                    ELSE 'X'
                                END;

                    -- Insert record
                    INSERT INTO health_institute (
                        health_institute_type,
                        email,
                        health_institute_name,
                        password,
                        created_at
                    )
                    VALUES (
                        p_healthInstituteType,
                        p_email,
                        p_healthInstituteName,
                        p_password,
                        NOW()
                    )
                    RETURNING id INTO v_id;

                    -- Generate User ID
                    v_userId := v_prefix || LPAD(v_id::TEXT, 6, '0');

                    -- Update User ID
                    UPDATE health_institute
                    SET
                        user_id = v_userId,
                        updated_at = NOW()
                    WHERE id = v_id;

                    -- Return generated userId
                    p_result := v_userId;

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
                            'register_health_institute',
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
        await queryRunner.query( `DROP PROCEDURE IF EXISTS register_health_institute( INT, VARCHAR, VARCHAR, VARCHAR);` );
    }

}
