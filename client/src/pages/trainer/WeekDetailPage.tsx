import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityBadge } from "@/components/common/StatusBadge";
import {
  useWeek,
  useSetWeekLock,
  useCreateTopic,
  useDeleteTopic,
  useCreateResearchQuestion,
  useDeleteResearchQuestion,
  useCreateResource,
  useDeleteResource,
} from "@/hooks/usePrograms";
import { useCreateTask, useDeleteTask } from "@/hooks/useTasks";
import { getErrorMessage } from "@/api/client";
import { formatDate } from "@/lib/format";
import type { ResourceType, TaskDifficulty, TaskPriority, TaskType } from "@/types";

export default function TrainerWeekDetailPage() {
  const { t } = useTranslation(["program", "common"]);
  const { weekId } = useParams<{ weekId: string }>();
  const { data: week, isLoading, isError, refetch } = useWeek(weekId);
  const setWeekLock = useSetWeekLock();

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !week) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/trainer/program">
          <ArrowLeft className="h-4 w-4" /> {t("program:trainer.week.back")}
        </Link>
      </Button>

      <PageHeader
        title={`${t("common:table.week")} ${week.weekNumber}: ${week.title}`}
        description={week.description}
        actions={
          <div className="flex items-center gap-2">
            <Switch
              checked={!week.isLocked}
              onCheckedChange={(checked) =>
                setWeekLock.mutate(
                  { weekId: week.id, isLocked: !checked },
                  { onError: (error) => toast.error(getErrorMessage(error)) }
                )
              }
            />
            <span className="text-sm text-muted-foreground">{week.isLocked ? t("common:status.locked") : t("common:status.unlocked")}</span>
          </div>
        }
      />

      {week.objectives.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="mb-2 text-sm font-semibold">{t("program:trainer.week.objectives")}</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {week.objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">{t("program:trainer.week.tabTasks", { count: week.tasks.length })}</TabsTrigger>
          <TabsTrigger value="resources">{t("program:trainer.week.tabResources", { count: week.resources.length })}</TabsTrigger>
          <TabsTrigger value="topics">{t("program:trainer.week.tabTopics", { count: week.topics.length })}</TabsTrigger>
          <TabsTrigger value="research">{t("program:trainer.week.tabResearch", { count: week.researchQuestions.length })}</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <TasksTab weekId={week.id} tasks={week.tasks} />
        </TabsContent>
        <TabsContent value="resources">
          <ResourcesTab weekId={week.id} resources={week.resources} />
        </TabsContent>
        <TabsContent value="topics">
          <TopicsTab weekId={week.id} topics={week.topics} />
        </TabsContent>
        <TabsContent value="research">
          <ResearchTab weekId={week.id} questions={week.researchQuestions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Tasks ──────────────────────────────────────────────────────────────

function TasksTab({ weekId, tasks }: { weekId: string; tasks: import("@/types").Task[] }) {
  const { t } = useTranslation(["program", "common"]);
  const [open, setOpen] = useState(false);
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    type: "CODING" as TaskType,
    priority: "MEDIUM" as TaskPriority,
    difficulty: "MEDIUM" as TaskDifficulty,
    points: 10,
    estimatedHours: 2,
    dueDate: "",
    instructions: "",
    acceptanceCriteria: "",
    isWeeklyProject: false,
  });

  const submit = () => {
    createTask.mutate(
      {
        ...form,
        weekId,
        dueDate: form.dueDate || undefined,
        acceptanceCriteria: form.acceptanceCriteria.split("\n").map((s) => s.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          toast.success(t("program:trainer.week.taskCreated"));
          setOpen(false);
        },
        onError: (error) => toast.error(getErrorMessage(error, t("program:trainer.week.taskCreateError"))),
      }
    );
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" /> {t("program:trainer.week.addTask")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{t("program:trainer.week.addTaskTitle")}</DialogTitle>
              </DialogHeader>
              <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t("program:trainer.week.code")}</Label>
                    <Input placeholder="JS-001" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("program:trainer.week.points")}</Label>
                    <Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("program:trainer.week.taskTitle")}</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("program:trainer.week.taskDescription")}</Label>
                  <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t("program:trainer.week.type")}</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TaskType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["LEARNING", "CODING", "PROBLEM_SOLVING", "RESEARCH", "PROJECT"].map((ty) => (
                          <SelectItem key={ty} value={ty}>{t(`common:taskTypeLabels.${ty}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("program:trainer.week.priority")}</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as TaskPriority })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                          <SelectItem key={p} value={p}>{t(`common:priorityLabels.${p}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("program:trainer.week.difficulty")}</Label>
                    <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as TaskDifficulty })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["EASY", "MEDIUM", "HARD"].map((d) => (
                          <SelectItem key={d} value={d}>{t(`common:difficultyLabels.${d}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t("program:trainer.week.estimatedHours")}</Label>
                    <Input type="number" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("program:trainer.week.dueDate")}</Label>
                    <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("program:trainer.week.instructions")}</Label>
                  <Textarea rows={3} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("program:trainer.week.acceptanceCriteria")}</Label>
                  <Textarea rows={3} value={form.acceptanceCriteria} onChange={(e) => setForm({ ...form, acceptanceCriteria: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.isWeeklyProject} onCheckedChange={(v) => setForm({ ...form, isWeeklyProject: v })} />
                  {t("program:trainer.week.isWeeklyProject")}
                </label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>{t("common:actions.cancel")}</Button>
                <Button onClick={submit} disabled={createTask.isPending || !form.code || !form.title}>
                  {createTask.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("program:trainer.week.createTask")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {tasks.length === 0 ? (
          <EmptyState className="border-0" title={t("program:trainer.week.noTasksYet")} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common:table.code")}</TableHead>
                <TableHead>{t("common:table.title")}</TableHead>
                <TableHead>{t("common:table.priority")}</TableHead>
                <TableHead>{t("common:table.points")}</TableHead>
                <TableHead>{t("common:table.dueDate")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-mono text-xs">{task.code}</TableCell>
                  <TableCell>
                    {task.title} {task.isWeeklyProject && <Badge variant="outline" className="ml-1">{t("common:taskTypeLabels.PROJECT")}</Badge>}
                  </TableCell>
                  <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                  <TableCell>{task.points}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        deleteTask.mutate(task.id, {
                          onSuccess: () => toast.success(t("program:trainer.week.taskDeleted")),
                          onError: (error) => toast.error(getErrorMessage(error)),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ── Resources ──────────────────────────────────────────────────────────

function ResourcesTab({ weekId, resources }: { weekId: string; resources: import("@/types").Resource[] }) {
  const { t } = useTranslation(["program", "common"]);
  const [open, setOpen] = useState(false);
  const createResource = useCreateResource(weekId);
  const deleteResource = useDeleteResource(weekId);
  const [form, setForm] = useState({ title: "", description: "", url: "", type: "DOCUMENTATION" as ResourceType, isRequired: false });

  const submit = () => {
    createResource.mutate(form, {
      onSuccess: () => {
        toast.success(t("program:trainer.week.resourceAdded"));
        setOpen(false);
        setForm({ title: "", description: "", url: "", type: "DOCUMENTATION", isRequired: false });
      },
      onError: (error) => toast.error(getErrorMessage(error, t("program:trainer.week.resourceAddError"))),
    });
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" /> {t("program:trainer.week.addResource")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("program:trainer.week.addResourceTitle")}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{t("program:trainer.week.resourceTitle")}</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("program:trainer.week.resourceDescription")}</Label>
                  <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("program:trainer.week.url")}</Label>
                  <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t("program:trainer.week.type2")}</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ResourceType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["DOCUMENTATION", "ARTICLE", "VIDEO", "COURSE", "BOOK", "OTHER"].map((ty) => (
                          <SelectItem key={ty} value={ty}>{t(`common:resourceTypeLabels.${ty}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <label className="mt-6 flex items-center gap-2 text-sm">
                    <Switch checked={form.isRequired} onCheckedChange={(v) => setForm({ ...form, isRequired: v })} />
                    {t("common:status.required")}
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>{t("common:actions.cancel")}</Button>
                <Button onClick={submit} disabled={createResource.isPending || !form.title || !form.url}>
                  {createResource.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("program:trainer.week.add")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {resources.length === 0 ? (
          <EmptyState className="border-0" title={t("program:trainer.week.noResourcesYet")} />
        ) : (
          <div className="divide-y">
            {resources.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium hover:underline">
                    {r.title} <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t(`common:resourceTypeLabels.${r.type}`)}</Badge>
                  {r.isRequired && <Badge variant="warning">{t("common:status.required")}</Badge>}
                  <Button variant="ghost" size="icon" onClick={() => deleteResource.mutate(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Topics ─────────────────────────────────────────────────────────────

function TopicsTab({ weekId, topics }: { weekId: string; topics: import("@/types").Topic[] }) {
  const { t } = useTranslation(["program", "common"]);
  const [title, setTitle] = useState("");
  const createTopic = useCreateTopic(weekId);
  const deleteTopic = useDeleteTopic(weekId);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex gap-2">
          <Input placeholder={t("program:trainer.week.newTopicPlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button
            disabled={!title.trim() || createTopic.isPending}
            onClick={() =>
              createTopic.mutate(
                { title, order: topics.length },
                { onSuccess: () => setTitle(""), onError: (error) => toast.error(getErrorMessage(error)) }
              )
            }
          >
            {t("program:trainer.week.add")}
          </Button>
        </div>
        {topics.length === 0 ? (
          <EmptyState className="border-0" title={t("program:trainer.week.noTopicsYet")} />
        ) : (
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Badge key={topic.id} variant="secondary" className="gap-1 py-1.5">
                {topic.title}
                <button onClick={() => deleteTopic.mutate(topic.id)}>
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Research Questions ────────────────────────────────────────────────

function ResearchTab({ weekId, questions }: { weekId: string; questions: import("@/types").ResearchQuestion[] }) {
  const { t } = useTranslation(["program", "common"]);
  const [question, setQuestion] = useState("");
  const createQuestion = useCreateResearchQuestion(weekId);
  const deleteQuestion = useDeleteResearchQuestion(weekId);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex gap-2">
          <Input placeholder={t("program:trainer.week.newQuestionPlaceholder")} value={question} onChange={(e) => setQuestion(e.target.value)} />
          <Button
            disabled={!question.trim() || createQuestion.isPending}
            onClick={() =>
              createQuestion.mutate(
                { question, order: questions.length },
                { onSuccess: () => setQuestion(""), onError: (error) => toast.error(getErrorMessage(error)) }
              )
            }
          >
            {t("program:trainer.week.add")}
          </Button>
        </div>
        {questions.length === 0 ? (
          <EmptyState className="border-0" title={t("program:trainer.week.noQuestionsYet")} />
        ) : (
          <div className="space-y-2">
            {questions.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                {q.question}
                <Button variant="ghost" size="icon" onClick={() => deleteQuestion.mutate(q.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
