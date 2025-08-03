

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';


-- Table: panel_time_slots
CREATE TABLE IF NOT EXISTS public.panel_time_slots (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    panel_id uuid NOT NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_panel FOREIGN KEY(panel_id) REFERENCES public.panels(id) ON DELETE CASCADE
);

-- Table: applicant_time_slot
CREATE TABLE IF NOT EXISTS public.applicant_time_slot (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id uuid NOT NULL,
    panel_id uuid NOT NULL,
    time_slot_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_applicant FOREIGN KEY(applicant_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_panel FOREIGN KEY(panel_id) REFERENCES public.panels(id) ON DELETE CASCADE,
    CONSTRAINT fk_time_slot FOREIGN KEY(time_slot_id) REFERENCES public.panel_time_slots(id) ON DELETE CASCADE,
    CONSTRAINT unique_applicant_panel UNIQUE(applicant_id, panel_id),
    CONSTRAINT unique_time_slot UNIQUE(time_slot_id)
);



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."Recruiter Roles" AS ENUM (
    'recruiter',
    'evaluator'
);


ALTER TYPE "public"."Recruiter Roles" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'applicant',
    'recruiter',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile_on_signup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    INSERT INTO public.profiles (id, role, email, full_name, register_no)
        VALUES (
                NEW.id,
                        COALESCE(NEW.raw_user_meta_data ->> 'role', 'applicant'),
                                NEW.email,
                                        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
                                                COALESCE(NEW.raw_user_meta_data ->> 'register_no', NULL)
                                                    ) 
                                                        ON CONFLICT (id) DO UPDATE SET email = NEW.email;
                                                            
                                                                RETURN NEW;
                                                                    
                                                                    EXCEPTION
                                                                        WHEN others THEN 
                                                                                RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
                                                                                        RETURN NEW;
                                                                                        END;
                                                                                        $$;


ALTER FUNCTION "public"."create_profile_on_signup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_email"("user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
                                                                                            SELECT email
                                                                                                FROM auth.users
                                                                                                    WHERE id = user_id;
                                                                                                    $$;


ALTER FUNCTION "public"."get_user_email"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, email, role, full_name, register_no)
    values (
        new.id,
            new.email,
                'applicant',
                    new.raw_user_meta_data->>'full_name',
                        new.raw_user_meta_data->>'register_no'
                          );
                            return new;
                            end;
                            $$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_role_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
                                                                                                                BEGIN
                                                                                                                    -- If role changed to recruiter, ensure they have a record in recruiter_departments
                                                                                                                        IF NEW.role = 'recruiter' AND (OLD.role IS NULL OR OLD.role != 'recruiter') THEN
                                                                                                                                INSERT INTO recruiter_departments (recruiter_id, department_id)
                                                                                                                                        VALUES (NEW.id, NULL);
                                                                                                                                            END IF;
                                                                                                                                                
                                                                                                                                                    RETURN NEW;
                                                                                                                                                    END;
                                                                                                                                                    $$;


ALTER FUNCTION "public"."handle_role_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_recruiter"("user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
                                                                                                                                                        SELECT EXISTS (
                                                                                                                                                                SELECT 1
                                                                                                                                                                        FROM public.profiles
                                                                                                                                                                                WHERE id = user_id AND role = 'recruiter'
                                                                                                                                                                                    );
                                                                                                                                                                                    $$;


ALTER FUNCTION "public"."is_recruiter"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_role"("user_email" "text", "new_role" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
                                                                                                                                                                                    DECLARE 
                                                                                                                                                                                        success BOOLEAN;
                                                                                                                                                                                        BEGIN
                                                                                                                                                                                            UPDATE public.profiles
                                                                                                                                                                                                SET role = new_role, updated_at = NOW()
                                                                                                                                                                                                    WHERE email = user_email;
                                                                                                                                                                                                        
                                                                                                                                                                                                            GET DIAGNOSTICS success = ROW_COUNT;
                                                                                                                                                                                                                RETURN success > 0;
                                                                                                                                                                                                                END;
                                                                                                                                                                                                                $$;


ALTER FUNCTION "public"."update_user_role"("user_email" "text", "new_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
                                                                                                                                                                                                                DECLARE 
                                                                                                                                                                                                                    success BOOLEAN;
                                                                                                                                                                                                                    BEGIN
                                                                                                                                                                                                                        UPDATE public.profiles
                                                                                                                                                                                                                            SET role = new_role, updated_at = NOW()
                                                                                                                                                                                                                                WHERE id = user_id;
                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                        GET DIAGNOSTICS success = ROW_COUNT;
                                                                                                                                                                                                                                            RETURN success > 0;
                                                                                                                                                                                                                                            END;
                                                                                                                                                                                                                                            $$;


ALTER FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

-- Updated application_settings table
CREATE TABLE public.application_settings (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  deadline timestamp with time zone NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  deadline_name text NOT NULL DEFAULT 'application'::text,
  CONSTRAINT application_settings_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;


ALTER TABLE "public"."application_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."applications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "applicant_id" "uuid" NOT NULL,
    "first_pref_dept_id" "uuid" NOT NULL,
    "first_pref_reason" "text" NOT NULL,
    "second_pref_dept_id" "uuid" NOT NULL,
    "second_pref_reason" "text" NOT NULL,
    "priority_reason" "text" NOT NULL,
    "portfolio_link" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "name" "text",
    "email" "text",
    "register_no" "text",
    "first_pref_status" "text" DEFAULT 'pending'::"text",
    "second_pref_status" "text" DEFAULT 'pending'::"text",
    "first_pref_panel_id" "uuid",
    "second_pref_panel_id" "uuid",
    CONSTRAINT "applications_first_pref_status_check" CHECK (("first_pref_status" = ANY (ARRAY['pending'::"text", 'shortlisted'::"text", 'not_selected'::"text", 'accepted'::"text", 'rejected'::"text"]))),
    CONSTRAINT "applications_second_pref_status_check" CHECK (("second_pref_status" = ANY (ARRAY['pending'::"text", 'shortlisted'::"text", 'not_selected'::"text", 'accepted'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evaluations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "application_id" "uuid" NOT NULL,
    "recruiter_id" "uuid" NOT NULL,
    "score" smallint NOT NULL,
    "remarks" "text",
    "department_id" "uuid" NOT NULL
);


ALTER TABLE "public"."evaluations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "register_no" "text",
    "role" "public"."user_role" DEFAULT 'applicant'::"public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "email" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recruiter_departments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "recruiter_id" "uuid" NOT NULL,
    "department_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "role" "public"."Recruiter Roles" DEFAULT 'evaluator'::"public"."Recruiter Roles" NOT NULL,
    "panel_id" "uuid"
);


ALTER TABLE "public"."recruiter_departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recruitment_panel" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "meet_link" "text",
    "name" "text" NOT NULL,
    "department_id" "uuid" NOT NULL
);


ALTER TABLE "public"."recruitment_panel" OWNER TO "postgres";


ALTER TABLE ONLY "public"."application_settings"
    ADD CONSTRAINT "application_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recruiter_departments"
    ADD CONSTRAINT "recruiter_departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recruiter_departments"
    ADD CONSTRAINT "recruiter_departments_recruiter_id_department_id_key" UNIQUE ("recruiter_id", "department_id");



ALTER TABLE ONLY "public"."recruitment_panel"
    ADD CONSTRAINT "recruitment_panel_pkey" PRIMARY KEY ("id");



CREATE INDEX "profiles_email_idx" ON "public"."profiles" USING "btree" ("email");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_first_pref_dept_id_fkey" FOREIGN KEY ("first_pref_dept_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_first_pref_panel_id_fkey" FOREIGN KEY ("first_pref_panel_id") REFERENCES "public"."recruitment_panel"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_second_pref_dept_id_fkey" FOREIGN KEY ("second_pref_dept_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_second_pref_panel_id_fkey" FOREIGN KEY ("second_pref_panel_id") REFERENCES "public"."recruitment_panel"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id");



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_recruiter_id_fkey1" FOREIGN KEY ("recruiter_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recruiter_departments"
    ADD CONSTRAINT "recruiter_departments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."recruiter_departments"
    ADD CONSTRAINT "recruiter_departments_panel_id_fkey" FOREIGN KEY ("panel_id") REFERENCES "public"."recruitment_panel"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recruiter_departments"
    ADD CONSTRAINT "recruiter_departments_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recruiter_departments"
    ADD CONSTRAINT "recruiter_departments_recruiter_id_fkey1" FOREIGN KEY ("recruiter_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."recruitment_panel"
    ADD CONSTRAINT "recruitment_panel_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id");



ALTER TABLE "public"."application_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "application_settings_modify_recruiter" ON "public"."application_settings" USING ("public"."is_recruiter"());



CREATE POLICY "application_settings_select_all" ON "public"."application_settings" FOR SELECT USING (true);



ALTER TABLE "public"."applications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "applications_insert_own" ON "public"."applications" FOR INSERT WITH CHECK (("applicant_id" = "auth"."uid"()));



CREATE POLICY "applications_select_own" ON "public"."applications" FOR SELECT USING (("applicant_id" = "auth"."uid"()));



CREATE POLICY "applications_select_recruiter" ON "public"."applications" FOR SELECT USING ("public"."is_recruiter"());



CREATE POLICY "applications_update_own" ON "public"."applications" FOR UPDATE USING (("applicant_id" = "auth"."uid"()));



CREATE POLICY "applications_update_recruiter" ON "public"."applications" FOR UPDATE USING ("public"."is_recruiter"());



ALTER TABLE "public"."departments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "departments_modify_recruiter" ON "public"."departments" USING ("public"."is_recruiter"());



CREATE POLICY "departments_select_all" ON "public"."departments" FOR SELECT USING (true);



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles_select_recruiter" ON "public"."profiles" FOR SELECT USING ("public"."is_recruiter"());



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."recruiter_departments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "recruiters_can_manage_departments" ON "public"."recruiter_departments" USING ("public"."is_recruiter"());



CREATE POLICY "recruiters_can_view_own_departments" ON "public"."recruiter_departments" FOR SELECT USING ((("recruiter_id" = "auth"."uid"()) OR "public"."is_recruiter"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO "anon";
GRANT ALL ON SCHEMA "public" TO "authenticated";
GRANT ALL ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."create_profile_on_signup"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_on_signup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_on_signup"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_email"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_email"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_email"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_role_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_role_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_role_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_recruiter"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_recruiter"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_recruiter"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_role"("user_email" "text", "new_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_role"("user_email" "text", "new_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_role"("user_email" "text", "new_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."application_settings" TO "anon";
GRANT ALL ON TABLE "public"."application_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."application_settings" TO "service_role";



GRANT ALL ON TABLE "public"."applications" TO "anon";
GRANT ALL ON TABLE "public"."applications" TO "authenticated";
GRANT ALL ON TABLE "public"."applications" TO "service_role";



GRANT ALL ON TABLE "public"."departments" TO "anon";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "service_role";



GRANT ALL ON TABLE "public"."evaluations" TO "anon";
GRANT ALL ON TABLE "public"."evaluations" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluations" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."recruiter_departments" TO "anon";
GRANT ALL ON TABLE "public"."recruiter_departments" TO "authenticated";
GRANT ALL ON TABLE "public"."recruiter_departments" TO "service_role";



GRANT ALL ON TABLE "public"."recruitment_panel" TO "anon";
GRANT ALL ON TABLE "public"."recruitment_panel" TO "authenticated";
GRANT ALL ON TABLE "public"."recruitment_panel" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
