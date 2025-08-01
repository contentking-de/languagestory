'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface ActivityChartsProps {
  statistics: {
    activityCounts: Array<{ action: string; count: number }>;
    dailyActivity: Array<{ date: string; count: number; action: string }>;
    totalActivities: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function ActivityCharts({ statistics }: ActivityChartsProps) {
  const { activityCounts, dailyActivity } = statistics;

  // Prepare data for activity type distribution (pie chart)
  const activityTypeData = activityCounts.map((item, index) => ({
    name: item.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

  // Prepare data for daily trend (line chart)
  const dailyTrendData = dailyActivity.reduce((acc, curr) => {
    const existingDate = acc.find(item => item.date === curr.date);
    if (existingDate) {
      existingDate.total += curr.count;
    } else {
      acc.push({
        date: curr.date,
        total: curr.count
      });
    }
    return acc;
  }, [] as Array<{ date: string; total: number }>)
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  // Prepare data for activity by type over time (stacked area chart)
  const activityByTypeOverTime = dailyActivity.reduce((acc, curr) => {
    const date = curr.date;
    const existingDate = acc.find(item => item.date === date);
    
    if (existingDate) {
      existingDate[curr.action] = (existingDate[curr.action] || 0) + curr.count;
    } else {
      const newEntry: any = { date, formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
      newEntry[curr.action] = curr.count;
      acc.push(newEntry);
    }
    return acc;
  }, [] as any[])
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      {/* Activity Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Activity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {activityTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Daily Activity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity by Type Over Time (Stacked Area) */}
      {activityByTypeOverTime.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Activity Breakdown Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityByTypeOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis />
                <Tooltip />
                {activityCounts.map((activity, index) => (
                  <Area
                    key={activity.action}
                    type="monotone"
                    dataKey={activity.action}
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </>
  );
}