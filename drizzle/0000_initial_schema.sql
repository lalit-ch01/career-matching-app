CREATE TYPE "public"."career_environment" AS ENUM('structured', 'dynamic', 'balanced');--> statement-breakpoint
CREATE TYPE "public"."career_priority" AS ENUM('high-salary', 'job-stability', 'fast-growth', 'work-life-balance', 'creativity', 'social-impact', 'leadership-role');--> statement-breakpoint
CREATE TYPE "public"."degree_fit" AS ENUM('preferred', 'accepted');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('undergraduate', 'postgraduate', 'other');--> statement-breakpoint
CREATE TYPE "public"."relevance" AS ENUM('primary', 'secondary');--> statement-breakpoint
CREATE TYPE "public"."skill_category" AS ENUM('general', 'technology', 'data', 'business-finance', 'people-management', 'marketing');--> statement-breakpoint
CREATE TYPE "public"."work_style" AS ENUM('independent', 'mixed', 'team');--> statement-breakpoint
CREATE TYPE "public"."work_type" AS ENUM('analytical', 'creative', 'people-oriented', 'technical', 'management-oriented');--> statement-breakpoint
CREATE TABLE "assessment_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_profile_id" uuid NOT NULL,
	"questionnaire_version" text NOT NULL,
	"answers" jsonb NOT NULL,
	"profile_snapshot" jsonb NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment_responses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "career_degrees" (
	"career_slug" text NOT NULL,
	"degree_slug" text NOT NULL,
	"fit" "degree_fit" NOT NULL,
	CONSTRAINT "career_degrees_career_slug_degree_slug_pk" PRIMARY KEY("career_slug","degree_slug")
);
--> statement-breakpoint
ALTER TABLE "career_degrees" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "career_interests" (
	"career_slug" text NOT NULL,
	"interest_slug" text NOT NULL,
	"relevance" "relevance" NOT NULL,
	CONSTRAINT "career_interests_career_slug_interest_slug_pk" PRIMARY KEY("career_slug","interest_slug")
);
--> statement-breakpoint
ALTER TABLE "career_interests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "career_priorities" (
	"career_slug" text NOT NULL,
	"priority" "career_priority" NOT NULL,
	CONSTRAINT "career_priorities_career_slug_priority_pk" PRIMARY KEY("career_slug","priority")
);
--> statement-breakpoint
ALTER TABLE "career_priorities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "career_skills" (
	"career_slug" text NOT NULL,
	"skill_slug" text NOT NULL,
	"importance" smallint NOT NULL,
	CONSTRAINT "career_skills_career_slug_skill_slug_pk" PRIMARY KEY("career_slug","skill_slug"),
	CONSTRAINT "career_skills_importance_range" CHECK ("career_skills"."importance" between 1 and 3)
);
--> statement-breakpoint
ALTER TABLE "career_skills" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "career_work_types" (
	"career_slug" text NOT NULL,
	"work_type" "work_type" NOT NULL,
	"relevance" "relevance" NOT NULL,
	CONSTRAINT "career_work_types_career_slug_work_type_pk" PRIMARY KEY("career_slug","work_type")
);
--> statement-breakpoint
ALTER TABLE "career_work_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "careers" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"responsibilities" text[] NOT NULL,
	"education_summary" text NOT NULL,
	"work_style" "work_style" NOT NULL,
	"work_environment" "career_environment" NOT NULL,
	"first_steps" text[] NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "careers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "degrees" (
	"slug" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"level" "education_level" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "degrees" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "interests" (
	"slug" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "match_results" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "match_results_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"assessment_response_id" uuid NOT NULL,
	"career_slug" text NOT NULL,
	"rank" smallint NOT NULL,
	"match_percent" smallint NOT NULL,
	"breakdown" jsonb NOT NULL,
	"algorithm_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "match_results_percent_range" CHECK ("match_results"."match_percent" between 0 and 100),
	CONSTRAINT "match_results_rank_positive" CHECK ("match_results"."rank" > 0)
);
--> statement-breakpoint
ALTER TABLE "match_results" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "skill_learning_steps" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "skill_learning_steps_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"skill_slug" text NOT NULL,
	"step_order" smallint NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"resource_name" text,
	"resource_url" text,
	"estimated_hours" smallint NOT NULL,
	CONSTRAINT "skill_learning_steps_hours_positive" CHECK ("skill_learning_steps"."estimated_hours" > 0),
	CONSTRAINT "skill_learning_steps_url_https" CHECK ("skill_learning_steps"."resource_url" is null or "skill_learning_steps"."resource_url" like 'https://%')
);
--> statement-breakpoint
ALTER TABLE "skill_learning_steps" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "skills" (
	"slug" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"category" "skill_category" NOT NULL,
	"is_foundational" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "skills" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"college" text,
	"education_level" "education_level" NOT NULL,
	"degree_slug" text NOT NULL,
	"graduation_year" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_profiles_full_name_length" CHECK (char_length("student_profiles"."full_name") between 2 and 100),
	CONSTRAINT "student_profiles_graduation_year_range" CHECK ("student_profiles"."graduation_year" is null or "student_profiles"."graduation_year" between 1980 and 2100)
);
--> statement-breakpoint
ALTER TABLE "student_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_student_profile_id_student_profiles_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."student_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_degrees" ADD CONSTRAINT "career_degrees_career_slug_careers_slug_fk" FOREIGN KEY ("career_slug") REFERENCES "public"."careers"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "career_degrees" ADD CONSTRAINT "career_degrees_degree_slug_degrees_slug_fk" FOREIGN KEY ("degree_slug") REFERENCES "public"."degrees"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "career_interests" ADD CONSTRAINT "career_interests_career_slug_careers_slug_fk" FOREIGN KEY ("career_slug") REFERENCES "public"."careers"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "career_interests" ADD CONSTRAINT "career_interests_interest_slug_interests_slug_fk" FOREIGN KEY ("interest_slug") REFERENCES "public"."interests"("slug") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "career_priorities" ADD CONSTRAINT "career_priorities_career_slug_careers_slug_fk" FOREIGN KEY ("career_slug") REFERENCES "public"."careers"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "career_skills" ADD CONSTRAINT "career_skills_career_slug_careers_slug_fk" FOREIGN KEY ("career_slug") REFERENCES "public"."careers"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "career_skills" ADD CONSTRAINT "career_skills_skill_slug_skills_slug_fk" FOREIGN KEY ("skill_slug") REFERENCES "public"."skills"("slug") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "career_work_types" ADD CONSTRAINT "career_work_types_career_slug_careers_slug_fk" FOREIGN KEY ("career_slug") REFERENCES "public"."careers"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_assessment_response_id_assessment_responses_id_fk" FOREIGN KEY ("assessment_response_id") REFERENCES "public"."assessment_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_career_slug_careers_slug_fk" FOREIGN KEY ("career_slug") REFERENCES "public"."careers"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "skill_learning_steps" ADD CONSTRAINT "skill_learning_steps_skill_slug_skills_slug_fk" FOREIGN KEY ("skill_slug") REFERENCES "public"."skills"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_degree_slug_degrees_slug_fk" FOREIGN KEY ("degree_slug") REFERENCES "public"."degrees"("slug") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "assessment_responses_student_submitted_idx" ON "assessment_responses" USING btree ("student_profile_id","submitted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "career_degrees_degree_slug_idx" ON "career_degrees" USING btree ("degree_slug");--> statement-breakpoint
CREATE INDEX "career_interests_interest_slug_idx" ON "career_interests" USING btree ("interest_slug");--> statement-breakpoint
CREATE INDEX "career_skills_skill_slug_idx" ON "career_skills" USING btree ("skill_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "match_results_response_career_key" ON "match_results" USING btree ("assessment_response_id","career_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "match_results_response_rank_key" ON "match_results" USING btree ("assessment_response_id","rank");--> statement-breakpoint
CREATE INDEX "match_results_career_slug_idx" ON "match_results" USING btree ("career_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_learning_steps_skill_order_key" ON "skill_learning_steps" USING btree ("skill_slug","step_order");--> statement-breakpoint
CREATE INDEX "student_profiles_degree_slug_idx" ON "student_profiles" USING btree ("degree_slug");