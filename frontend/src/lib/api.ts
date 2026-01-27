import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Stack {
  name: string;
  category: string;
  avg_daily_activity: number;
  total_activity: number;
  trend: 'growing' | 'stable';
  model_type: string;
  forecast_horizon: number;
  last_trained: string;
}

export interface Category {
  name: string;
  stack_count: number;
  total_activity: number;
  avg_daily_activity: number;
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ForecastData {
  stack_name: string;
  forecast: ForecastPoint[];
  recent_average: number;
  historical_total: number;
  trend_direction: 'up' | 'down' | 'stable';
  model_used: string;
  confidence_interval: number;
}

export interface DashboardData {
  total_stacks: number;
  total_categories: number;
  total_activity: number;
  growing_stacks_count: number;
  avg_daily_activity: number;
  top_growing_stacks: Stack[];
  category_distribution: { name: string; value: number }[];
  categories: {
    name: string;
    stacks: Stack[];
    total_activity: number;
    avg_daily_activity: number;
  }[];
}

export interface ComparisonData {
  stacks: {
    name: string;
    category: string;
    trend: 'growing' | 'stable';
    total_activity: number;
    avg_daily_activity: number;
    max_daily: number;
    min_daily: number;
  }[];
}

export interface CategoryTrend {
  category: string;
  stacks: Stack[];
  top_stacks: Stack[];
  fastest_growing: Stack[];
}

// Mock data generators for development
const generateMockStacks = (): Stack[] => {
  const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'AI/ML'];
  const stacks = [
    'React', 'Vue', 'Angular', 'Svelte', 'Next.js',
    'Node.js', 'Python', 'Go', 'Rust', 'Java',
    'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Elasticsearch',
    'Docker', 'Kubernetes', 'Terraform', 'AWS', 'Azure',
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic',
    'TensorFlow', 'PyTorch', 'OpenAI', 'LangChain', 'Hugging Face'
  ];

  return stacks.map((name, index) => ({
    name,
    category: categories[Math.floor(index / 5)],
    avg_daily_activity: Math.floor(Math.random() * 5000) + 500,
    total_activity: Math.floor(Math.random() * 500000) + 50000,
    trend: Math.random() > 0.4 ? 'growing' : 'stable',
    model_type: 'Prophet',
    forecast_horizon: 30,
    last_trained: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const generateMockCategories = (): Category[] => {
  return [
    { name: 'Frontend', stack_count: 5, total_activity: 850000, avg_daily_activity: 28333 },
    { name: 'Backend', stack_count: 5, total_activity: 920000, avg_daily_activity: 30667 },
    { name: 'Database', stack_count: 5, total_activity: 670000, avg_daily_activity: 22333 },
    { name: 'DevOps', stack_count: 5, total_activity: 580000, avg_daily_activity: 19333 },
    { name: 'Mobile', stack_count: 5, total_activity: 420000, avg_daily_activity: 14000 },
    { name: 'AI/ML', stack_count: 5, total_activity: 780000, avg_daily_activity: 26000 },
  ];
};

const generateMockForecast = (stackName: string, days: number): ForecastData => {
  const forecast: ForecastPoint[] = [];
  const baseValue = Math.random() * 3000 + 1000;
  const trend = Math.random() > 0.5 ? 1.02 : 0.99;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const predicted = baseValue * Math.pow(trend, i) + (Math.random() - 0.5) * 200;
    forecast.push({
      date: date.toISOString().split('T')[0],
      predicted: Math.round(predicted),
      lower_bound: Math.round(predicted * 0.85),
      upper_bound: Math.round(predicted * 1.15),
    });
  }

  return {
    stack_name: stackName,
    forecast,
    recent_average: Math.round(baseValue),
    historical_total: Math.round(baseValue * 365),
    trend_direction: trend > 1 ? 'up' : 'stable',
    model_used: 'Prophet',
    confidence_interval: 95,
  };
};

const generateMockDashboard = (): DashboardData => {
  const stacks = generateMockStacks();
  const growingStacks = stacks.filter(s => s.trend === 'growing').sort((a, b) => b.avg_daily_activity - a.avg_daily_activity);

  return {
    total_stacks: stacks.length,
    total_categories: 6,
    total_activity: stacks.reduce((sum, s) => sum + s.total_activity, 0),
    growing_stacks_count: growingStacks.length,
    avg_daily_activity: Math.round(stacks.reduce((sum, s) => sum + s.avg_daily_activity, 0) / stacks.length),
    top_growing_stacks: growingStacks.slice(0, 8),
    category_distribution: generateMockCategories().map(c => ({ name: c.name, value: c.total_activity })),
    categories: generateMockCategories().map(c => ({
      name: c.name,
      stacks: stacks.filter(s => s.category === c.name),
      total_activity: c.total_activity,
      avg_daily_activity: c.avg_daily_activity,
    })),
  };
};

const generateMockComparison = (stackNames: string[]): ComparisonData => {
  const allStacks = generateMockStacks();
  return {
    stacks: stackNames.map(name => {
      const stack = allStacks.find(s => s.name.toLowerCase() === name.toLowerCase()) || {
        name,
        category: 'Unknown',
        trend: 'stable' as const,
        total_activity: Math.floor(Math.random() * 500000),
        avg_daily_activity: Math.floor(Math.random() * 5000),
      };
      return {
        ...stack,
        max_daily: Math.round(stack.avg_daily_activity * 1.5),
        min_daily: Math.round(stack.avg_daily_activity * 0.5),
      };
    }),
  };
};

const generateMockCategoryTrend = (category: string): CategoryTrend => {
  const stacks = generateMockStacks().filter(s => s.category.toLowerCase() === category.toLowerCase());
  const sorted = [...stacks].sort((a, b) => b.avg_daily_activity - a.avg_daily_activity);
  const growing = stacks.filter(s => s.trend === 'growing').sort((a, b) => b.avg_daily_activity - a.avg_daily_activity);

  return {
    category,
    stacks,
    top_stacks: sorted.slice(0, 5),
    fastest_growing: growing.slice(0, 3),
  };
};

// API Functions with mock fallback
export const fetchStacks = async (): Promise<Stack[]> => {
  // Always use mock data for demo
  return generateMockStacks();
};

export const fetchCategories = async (): Promise<Category[]> => {
  return generateMockCategories();
};

export const fetchForecast = async (stackName: string, days: number = 30): Promise<ForecastData> => {
  return generateMockForecast(stackName, days);
};

export const fetchDashboard = async (): Promise<DashboardData> => {
  return generateMockDashboard();
};

export const fetchComparison = async (stacks: string[]): Promise<ComparisonData> => {
  return generateMockComparison(stacks);
};

export const fetchCategoryTrends = async (category: string): Promise<CategoryTrend> => {
  return generateMockCategoryTrend(category);
};

export default api;
