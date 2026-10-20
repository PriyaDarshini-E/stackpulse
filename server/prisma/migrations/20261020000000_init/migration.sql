-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developers" (
    "id" TEXT NOT NULL,
    "github_username" TEXT NOT NULL,
    "avatar_url" TEXT,
    "name" TEXT,
    "bio" TEXT,
    "company" TEXT,
    "location" TEXT,
    "blog" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "public_repos" INTEGER NOT NULL DEFAULT 0,
    "total_stars" INTEGER NOT NULL DEFAULT 0,
    "language_breakdown" JSONB,
    "commit_activity" JSONB,
    "etag" TEXT,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "developers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repos" (
    "id" TEXT NOT NULL,
    "developer_id" TEXT NOT NULL,
    "github_repo_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "primary_language" TEXT,
    "pushed_at" TIMESTAMP(3),
    "html_url" TEXT NOT NULL,
    "description" TEXT,
    "languages" JSONB,
    "commits_fetched_at" TIMESTAMP(3),

    CONSTRAINT "repos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparisons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison_devs" (
    "comparison_id" TEXT NOT NULL,
    "developer_id" TEXT NOT NULL,

    CONSTRAINT "comparison_devs_pkey" PRIMARY KEY ("comparison_id","developer_id")
);

-- CreateTable
CREATE TABLE "pins" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "note" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "developers_github_username_key" ON "developers"("github_username");

-- CreateIndex
CREATE INDEX "developers_github_username_idx" ON "developers"("github_username");

-- CreateIndex
CREATE INDEX "developers_fetched_at_idx" ON "developers"("fetched_at");

-- CreateIndex
CREATE INDEX "repos_developer_id_idx" ON "repos"("developer_id");

-- CreateIndex
CREATE INDEX "repos_stars_idx" ON "repos"("stars");

-- CreateIndex
CREATE UNIQUE INDEX "repos_developer_id_name_key" ON "repos"("developer_id", "name");

-- CreateIndex
CREATE INDEX "comparisons_user_id_idx" ON "comparisons"("user_id");

-- CreateIndex
CREATE INDEX "comparison_devs_comparison_id_idx" ON "comparison_devs"("comparison_id");

-- CreateIndex
CREATE INDEX "comparison_devs_developer_id_idx" ON "comparison_devs"("developer_id");

-- CreateIndex
CREATE INDEX "pins_user_id_idx" ON "pins"("user_id");

-- CreateIndex
CREATE INDEX "pins_repo_id_idx" ON "pins"("repo_id");

-- CreateIndex
CREATE UNIQUE INDEX "pins_user_id_repo_id_key" ON "pins"("user_id", "repo_id");

-- AddForeignKey
ALTER TABLE "repos" ADD CONSTRAINT "repos_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_devs" ADD CONSTRAINT "comparison_devs_comparison_id_fkey" FOREIGN KEY ("comparison_id") REFERENCES "comparisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_devs" ADD CONSTRAINT "comparison_devs_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pins" ADD CONSTRAINT "pins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pins" ADD CONSTRAINT "pins_repo_id_fkey" FOREIGN KEY ("repo_id") REFERENCES "repos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
