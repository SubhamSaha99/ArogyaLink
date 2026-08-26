import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoginHealthInstitute1782706056345 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION login_health_institute(
            p_email VARCHAR(255)
        )
        RETURNS TABLE (
            status VARCHAR,
            "healthInstitutePrimaryKey" INTEGER,
            "healthInstituteId" VARCHAR,
            email VARCHAR,
            password VARCHAR
        )
        LANGUAGE plpgsql
        AS $$
        DECLARE
            v_sqlstate TEXT;
            v_message TEXT;
            v_detail TEXT;
        BEGIN
        
            -- Verify health institute exists
            IF NOT EXISTS (
                SELECT 1
                FROM health_institute hi
                WHERE hi.email = p_email
            ) THEN
        
                RETURN QUERY
                SELECT
                    'invalidCredential'::VARCHAR,
                    NULL:: INTEGER,
                    NULL::VARCHAR,
                    NULL::VARCHAR,
                    NULL::VARCHAR;
        
                RETURN;
            END IF;
        
        
            -- Return health institute details
            RETURN QUERY
            SELECT
                'SUCCESS'::VARCHAR AS status,		
				hi.id AS "healthInstitutePrimaryKey",
                hi.health_institute_id AS "healthInstituteId",
                hi.email,
                hi.password
            FROM health_institute hi
            WHERE hi.email = p_email;
        
        
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
                    'login_health_institute',
                    v_sqlstate,
                    v_message,
                    COALESCE(v_detail, ''),
                    NOW()
                );
        
                RETURN QUERY
                SELECT
                    'dbError'::VARCHAR,
                    NULL:: INTEGER,
                    NULL::VARCHAR,
                    NULL::VARCHAR,
                    NULL::VARCHAR;
        
        END;
        $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS login_health_institute(VARCHAR);`,
    );
  }
}
