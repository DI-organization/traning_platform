import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { initials } from "@/lib/format";
import { CheckCircle2, Clock, AlertTriangle, FileCheck2 } from "lucide-react";

// Validated categorical palette (light mode) — see dataviz skill reference
const SEQ_BLUE = "#2a78d6";
const CAT = { blue: "#2a78d6", orange: "#eb6834", aqua: "#1baf7a" };
const STATUS = { good: "#0ca30c", warning: "#fab219", serious: "#ec835a", critical: "#d03b3b", muted: "#898781" };
const AXIS_INK = "#898781";
const GRID = "#e1e0d9";

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: STATUS.muted,
  IN_PROGRESS: CAT.blue,
  SUBMITTED: STATUS.warning,
  CHANGES_REQUESTED: STATUS.serious,
  APPROVED: STATUS.good,
  OVERDUE: STATUS.critical,
};

export default function TrainerAnalyticsPage() {
  const { data, isLoading, isError, refetch } = useAnalytics();

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const scoreData = [
    { name: "Excellent (85-100)", value: data.scoreDistribution.excellent, color: STATUS.good },
    { name: "Good (75-84)", value: data.scoreDistribution.good, color: CAT.blue },
    { name: "Needs Improvement (65-74)", value: data.scoreDistribution.needsImprovement, color: STATUS.warning },
    { name: "Improvement Required (<65)", value: data.scoreDistribution.improvementRequired, color: STATUS.critical },
  ];

  const difficultyColors = [CAT.blue, CAT.orange, CAT.aqua];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Program-wide performance and progress insights." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Completion Rate" value={`${data.kpis.overallCompletionPercent}%`} icon={CheckCircle2} tone="success" />
        <StatCard label="Average Score" value={data.kpis.averageScore} icon={FileCheck2} />
        <StatCard label="Tasks Overdue" value={data.kpis.overdueTasks} icon={AlertTriangle} tone="destructive" />
        <StatCard label="Awaiting Review" value={data.kpis.pendingReviews} icon={Clock} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Weekly Completion</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyCompletion} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="weekNumber" tickFormatter={(v) => `W${v}`} tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={{ stroke: GRID }} tickLine={false} />
                <YAxis unit="%" tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Completion"]} labelFormatter={(v) => `Week ${v}`} />
                <Bar dataKey="completionPercent" name="Completion %" fill={SEQ_BLUE} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Score Distribution</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={160} tick={{ fill: AXIS_INK, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" name="Trainees" radius={[0, 4, 4, 0]}>
                  {scoreData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Task Status Distribution</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.taskStatusDistribution} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="status" tick={{ fill: AXIS_INK, fontSize: 10 }} axisLine={{ stroke: GRID }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" name="Assignments" radius={[4, 4, 0, 0]}>
                  {data.taskStatusDistribution.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? CAT.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Average Score by Task Difficulty</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.taskDifficultyPerformance} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="difficulty" tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={{ stroke: GRID }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageScore" name="Average Score" radius={[4, 4, 0, 0]}>
                  {data.taskDifficultyPerformance.map((entry, i) => (
                    <Cell key={entry.difficulty} fill={difficultyColors[i % difficultyColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Trainee Comparison</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainee</TableHead>
                <TableHead>Week</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Avg Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.traineeComparison.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7"><AvatarFallback>{initials(t.firstName, t.lastName)}</AvatarFallback></Avatar>
                      <span className="font-medium">{t.firstName} {t.lastName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{t.currentWeek ?? "—"}</TableCell>
                  <TableCell className="w-40">
                    <div className="flex items-center gap-2">
                      <Progress value={t.progressPercent} className="h-1.5 w-24" />
                      <span className="text-xs text-muted-foreground">{t.progressPercent}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{t.completedTasks}/{t.totalTasks}</TableCell>
                  <TableCell>{t.averageScore}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
