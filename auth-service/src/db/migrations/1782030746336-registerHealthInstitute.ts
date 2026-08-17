import { MigrationInterface, QueryRunner } from 'typeorm';

export class RegisterHealthInstitute1782030746336 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION register_health_institute(
                p_email VARCHAR(255),
                p_password VARCHAR(255),
                p_health_institute_type SMALLINT
            )
            RETURNS VARCHAR(50)
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_id BIGINT;
                v_health_institute_id VARCHAR(20);
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
                    RETURN 'emailExist';
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
            
            
                -- Generate health institute ID
                v_health_institute_id :=
                    v_prefix || LPAD(v_id::TEXT, 6, '0');
            
            
                -- Update generated health institute ID
                UPDATE health_institute
                SET
                    health_institute_id = v_health_institute_id,
                    updated_at = NOW()
                WHERE id = v_id;
            
            
                -- Return generated health institute ID
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
                        'register_health_institute',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );
            
                    RETURN 'dbError';
            
            END;
            $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS register_health_institute(VARCHAR, VARCHAR, SMALLINT);`,
    );
  }
}
