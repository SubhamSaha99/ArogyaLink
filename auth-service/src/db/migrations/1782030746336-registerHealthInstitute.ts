import { MigrationInterface, QueryRunner } from 'typeorm';

export class RegisterHealthInstitute1782030746336 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION public.register_health_institute(
                p_email VARCHAR,
                p_password VARCHAR,
                p_health_institute_type SMALLINT
            )
            RETURNS TABLE (
                status VARCHAR,
                "healthInstitutePrimaryKey" INTEGER,
                "healthInstituteId" VARCHAR
            )
            LANGUAGE plpgsql
            AS $function$
            DECLARE
                v_id BIGINT;
                v_health_institute_id VARCHAR(50);
                v_prefix CHAR(1);

                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
            BEGIN

                -- Check if email already exists
                IF EXISTS (
                    SELECT 1
                    FROM health_institute hi
                    WHERE hi.email = p_email
                ) THEN

                    RETURN QUERY
                    SELECT
                        'emailExist'::VARCHAR,
                        0::INTEGER,
                        ''::VARCHAR;

                    RETURN;
                END IF;


                -- Determine prefix
                v_prefix := CASE p_health_institute_type
                    WHEN 1 THEN 'H'
                    WHEN 2 THEN 'N'
                    WHEN 3 THEN 'D'
                    ELSE 'X'
                END;


                -- Insert health institute
                INSERT INTO health_institute (
                    email,
                    password,
                    created_at
                )
                VALUES (
                    p_email,
                    p_password,
                    NOW()
                )
                RETURNING id INTO v_id;


                -- Generate Health Institute ID
                v_health_institute_id :=
                    'AGL-' || v_prefix || LPAD(v_id::TEXT, 6, '0');


                -- Update generated Health Institute ID
                UPDATE health_institute
                SET
                    health_institute_id = v_health_institute_id,
                    updated_at = NOW()
                WHERE id = v_id;


                -- Success response
                RETURN QUERY
                SELECT
                    'SUCCESS'::VARCHAR,
                    v_id::INTEGER,
                    v_health_institute_id::VARCHAR;


            EXCEPTION
                WHEN OTHERS THEN

                    -- Capture PostgreSQL error
                    GET STACKED DIAGNOSTICS
                        v_sqlstate = RETURNED_SQLSTATE,
                        v_message = MESSAGE_TEXT,
                        v_detail = PG_EXCEPTION_DETAIL;


                    -- Log database exception
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


                    -- Database error response
                    RETURN QUERY
                    SELECT
                        'dbError'::VARCHAR,
                        0::INTEGER,
                        ''::VARCHAR;

            END;
            $function$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS register_health_institute(VARCHAR, VARCHAR, SMALLINT);`,
    );
  }
}
