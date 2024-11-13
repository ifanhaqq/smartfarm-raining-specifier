-- CreateTable
CREATE TABLE "MonthlyStats" (
    "id" BIGSERIAL NOT NULL,
    "month" TEXT NOT NULL,
    "t_avg" DOUBLE PRECISION NOT NULL,
    "heat_index" DOUBLE PRECISION NOT NULL,
    "etp" DOUBLE PRECISION NOT NULL,
    "day_amount" INTEGER NOT NULL,

    CONSTRAINT "MonthlyStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionsHistory" (
    "id" BIGSERIAL NOT NULL,
    "groundwater_level" DOUBLE PRECISION NOT NULL,
    "groundwater_available" DOUBLE PRECISION NOT NULL,
    "user_id" BIGINT NOT NULL,
    "field_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PredictionsHistory_pkey" PRIMARY KEY ("id")
);
