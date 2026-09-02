import { MigrationInterface, QueryRunner } from "typeorm";

export class GetAppointedDoctors1788066112334 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_appointed_doctors(
                p_health_institute_primary_key INTEGER,
                p_offset INTEGER DEFAULT 0,
                p_limit INTEGER DEFAULT 10,
                p_search VARCHAR DEFAULT NULL,
                p_department_id INTEGER DEFAULT NULL,
                p_designation INTEGER DEFAULT NULL,
                p_consultation_scope INTEGER DEFAULT NULL
            )
            RETURNS TABLE (
                doctors JSONB,
                total BIGINT,
                "offset" INTEGER,
                "limit" INTEGER
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_sqlstate TEXT;
                v_message TEXT;
                v_detail TEXT;
                v_search TEXT;
            BEGIN

                -- Normalize search
                v_search := NULLIF(BTRIM(p_search), '');

                -- Normalize pagination
                p_offset := GREATEST(COALESCE(p_offset, 0), 0);

                p_limit := LEAST(
                    GREATEST(COALESCE(p_limit, 10), 1),
                    100
                );


                RETURN QUERY

                WITH filtered_doctors AS (
                    SELECT
                        him.id,
                        him.doctor_primary_key,
                        him.doctor_id,
                        him.department_id,
                        dm.department_name,
                        him.designation_id,
                        dsm.designation_name,
                        him.joining_date,
                        him.consultation_scope_id,
                        csm.scope_name,
                        him.is_active,
                        him.created_at
                    FROM health_institute_doctor_mapping him
                    LEFT JOIN department_master dm ON him.department_id = dm.id AND dm.is_active = TRUE
                    LEFT JOIN designation_master dsm ON him.designation_id = dsm.id AND dsm.is_active = TRUE
                    LEFT JOIN consultation_scope_master csm ON him.consultation_scope_id = csm.id AND csm.is_active = TRUE
                    WHERE him.health_institute_primary_key = p_health_institute_primary_key
                    AND him.is_active = TRUE
                    AND (
                        v_search IS NULL
                        OR him.doctor_id ILIKE '%' || v_search || '%'
                    )
                    AND (
                        p_department_id IS NULL
                        OR him.department_id = p_department_id
                    )
                    AND (
                        p_designation IS NULL
                        OR him.designation_id = p_designation
                    )
                    AND (
                        p_consultation_scope IS NULL
                        OR him.consultation_scope_id = p_consultation_scope
                    )
                ),

                paginated_doctors AS (

                    SELECT *
                    FROM filtered_doctors
                    ORDER BY created_at DESC, id
                    LIMIT p_limit
                    OFFSET p_offset

                )

                SELECT

                    COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'mappingId', d.id,
                                    'doctorPrimaryKey', d.doctor_primary_key,
                                    'doctorId', d.doctor_id,
                                    'departmentId', d.department_id,
                                    'departmentName', d.department_name,
                                    'designationId', d.designation_id,
                                    'designationName', d.designation_name,
                                    'joiningDate', d.joining_date,
                                    'consultationScopeId', d.consultation_scope_id,
                                    'consultationScopeName', d.scope_name,
                                    'status', d.is_active

                                )
                                ORDER BY d.created_at DESC, d.id
                            )
                            FROM paginated_doctors d
                        ),
                        '[]'::JSONB
                    ) AS doctors,
                    (
                        SELECT COUNT(*)
                        FROM filtered_doctors
                    ) AS total,
                    p_offset AS "offset",
                    p_limit AS "limit";


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
                        'get_appointed_doctors',
                        v_sqlstate,
                        v_message,
                        COALESCE(v_detail, ''),
                        NOW()
                    );


                    RAISE;

            END;
            $$;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP FUNCTION IF EXISTS get_appointed_doctors(INTEGER, INTEGER, INTEGER, VARCHAR, INTEGER, INTEGER, INTEGER);`)
    }

}
