import { MigrationInterface, QueryRunner } from 'typeorm';

export class GetAssociatedHealthInstitutes1788150093724 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_associated_health_institutes(
                p_doctor_primary_key INTEGER
            )
            RETURNS TABLE (
                status VARCHAR,
                "healthInstitutes" JSONB
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
            BEGIN

                RETURN QUERY
                SELECT
                    'SUCCESS'::VARCHAR AS status,
                    COALESCE(
                        jsonb_agg(
                            jsonb_build_object(
                                'healthInstitutePrimaryKey',  him.health_institute_primary_key,
                                'healthInstituteId', him.health_institute_id,
                                'healthInstituteName', hip.health_institute_name,
                                'departmentId', him.department_id,
                                'departmentName', dm.department_name,
                                'designationId', him.designation_id,
                                'designationName', dsm.designation_name,
                                'joiningDate', him.joining_date,
                                'consultationScopeId', him.consultation_scope_id,
                                'consultationScopeName', csm.scope_name
                            )
                            ORDER BY him.created_at DESC, him.id
                        ),
                        '[]'::JSONB
                    ) AS "healthInstitutes"
                FROM health_institute_doctor_mapping him
                LEFT JOIN health_institute_profile hip ON him.health_institute_primary_key = hip.health_institute_primary_key
                LEFT JOIN department_master dm ON him.department_id = dm.id AND dm.is_active = TRUE
                LEFT JOIN designation_master dsm  ON him.designation_id = dsm.id AND dsm.is_active = TRUE
                LEFT JOIN consultation_scope_master csm ON him.consultation_scope_id = csm.id AND csm.is_active = TRUE
                WHERE him.doctor_primary_key = p_doctor_primary_key
                AND him.is_active = TRUE;


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
                        'get_associated_health_institutes',
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
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS get_associated_health_institutes(INTEGER);`,
    );
  }
}
