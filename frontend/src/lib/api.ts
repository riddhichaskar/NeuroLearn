import axios from "axios"

const API_BASE_URL = "http://localhost:8002/api/v1"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

/* =========================
   TYPES
========================= */

export interface Stack {
  name: string
  category: string
  avg_daily_activity: number
  total_activity: number
  trend: "growing" | "stable"
  model_type: string
  last_trained: string
}

export interface Category {
  name: string
  stack_count: number
  total_activity: number
  avg_daily_activity: number
}

export interface ForecastPoint {
  date: string
  predicted: number
  lower_bound: number
  upper_bound: number
}

export interface ForecastData {
  stack_name: string
  forecast: ForecastPoint[]
  recent_average: number
  historical_total: number
  trend_direction: "up" | "down" | "stable"
  model_used: string
  confidence_interval: number
}

export interface ComparisonData {
  stacks: {
    name: string
    category: string
    trend: "growing" | "stable"
    total_activity: number
    avg_daily_activity: number
    max_daily: number
    min_daily: number
  }[]
}

export interface CategoryTrend {
  category: string
  stacks: Stack[]
  top_stacks: Stack[]
  fastest_growing: Stack[]
}

/* =========================
   STACKS
========================= */

export const fetchStacks = async (): Promise<Stack[]> => {
  const res = await api.get("/stacks")

  const stacks = res.data.stacks || res.data

  return stacks.map((s: any) => ({
    name: s.stack,
    category: s.category,
    avg_daily_activity: s.average_daily ?? s.statistics?.average_daily ?? 0,
    total_activity: s.total_activity ?? s.statistics?.total_activity ?? 0,
    trend: s.trend ?? s.statistics?.trend ?? "stable",
    model_type: s.model?.type ?? "ML Model",
    last_trained: s.trained_at ?? new Date().toISOString(),
  }))
}

/* =========================
   CATEGORIES
========================= */

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await api.get("/categories")

  const categories = res.data.categories || res.data

  return categories.map((c: any) => ({
    name: c.category,
    stack_count: c.stack_count ?? (c.stacks ? c.stacks.length : 0),
    total_activity: c.total_activity ?? 0,
    avg_daily_activity: c.average_daily ?? 0,
  }))
}

/* =========================
   CATEGORY TRENDS
========================= */

export const fetchCategoryTrends = async (
  category: string
): Promise<CategoryTrend> => {

  const res = await api.get("/stacks")

  const stacks = (res.data.stacks || res.data)
    .filter((s: any) => s.category === category)
    .map((s: any) => ({
      name: s.stack,
      category: s.category,
      avg_daily_activity: s.average_daily ?? s.statistics?.average_daily ?? 0,
      total_activity: s.total_activity ?? s.statistics?.total_activity ?? 0,
      trend: s.trend ?? s.statistics?.trend ?? "stable",
      model_type: s.model?.type ?? "ML Model",
      last_trained: s.trained_at ?? new Date().toISOString(),
    }))

  const sorted = [...stacks].sort(
    (a, b) => b.avg_daily_activity - a.avg_daily_activity
  )

  const growing = sorted.filter((s) => s.trend === "growing")

  return {
    category,
    stacks,
    top_stacks: sorted.slice(0, 6),
    fastest_growing: growing.slice(0, 3),
  }
}

/* =========================
   FORECAST
========================= */

export const fetchForecast = async (
  stackName: string,
  days: number = 30
): Promise<ForecastData> => {

  const res = await api.get(`/forecast/${stackName}?days=${days}`)
  const d = res.data

  return {
    stack_name: d.stack,
    forecast: d.predictions.map((p: any) => ({
      date: p.date,
      predicted: p.predicted_activity,
      lower_bound: p.confidence_lower,
      upper_bound: p.confidence_upper
    })),
    recent_average: d.historical_stats?.recent_average ?? 0,
    historical_total: d.historical_stats?.total_activity ?? 0,
    trend_direction:
      d.historical_stats?.trend === "growing"
        ? "up"
        : d.historical_stats?.trend === "declining"
        ? "down"
        : "stable",
    model_used: d.metadata?.model_used ?? "prophet",
    confidence_interval: Math.round((d.confidence_interval ?? 0.95) * 100)
  }
}

/* =========================
   DASHBOARD
========================= */

export const fetchDashboard = async () => {

  const res = await api.get("/dashboard")

  return res.data
}

/* =========================
   COMPARISON
========================= */

export const fetchComparison = async (
  stacks: string[]
): Promise<ComparisonData> => {

  const stackQuery = stacks.join(",")

  const res = await api.get(`/compare?stacks=${stackQuery}`)

  const items = res.data.comparison || []

  return {
    stacks: items.map((s: any) => ({
      name: s.stack,
      category: s.category,
      trend: s.trend,
      total_activity: s.total_activity,
      avg_daily_activity: Math.round(s.average_daily),
      max_daily: s.max_daily,
      min_daily: s.min_daily,
    })),
  }
}