import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Project, ProjectActivityLog, ProjectWithActivities } from "../lib/types";
import { ActivityBoard } from "./activity-board";
import { CreateProjectDialog } from "./create-project-dialog";
import { LayoutGrid, Loader2, PlusCircle, AlertCircle } from "lucide-react";

export function MultiProjectDashboard() {
  const [projects, setProjects] = useState<ProjectWithActivities[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectsAndLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch activity logs for these projects
      const { data: logsData, error: logsError } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.id);

      if (logsError) throw logsError;

      const projectsWithLogs = (projectsData as Project[]).map(project => ({
        ...project,
        activities: (logsData as ProjectActivityLog[]).filter(log => log.project_id === project.id)
      }));

      setProjects(projectsWithLogs);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "データの読み込みに失敗しました。");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteProject = async (projectId: string) => {
    try {
      // Delete activity logs first
      const { error: logsError } = await supabase
        .from("activity_logs")
        .delete()
        .eq("project_id", projectId);

      if (logsError) throw logsError;

      // Then delete the project
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;
      
      // Refresh the list
      fetchProjectsAndLogs();
    } catch (err: any) {
      console.error("Error deleting project:", err);
      setError(err.message || "ボードの削除に失敗しました。");
    }
  };

  useEffect(() => {
    fetchProjectsAndLogs();
  }, [fetchProjectsAndLogs]);

  if (loading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 px-1 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
          <LayoutGrid className="w-3 h-3" />
          Multi-Project Boards
        </div>
        <CreateProjectDialog onProjectCreated={fetchProjectsAndLogs} />
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl bg-muted/30 gap-6">
          <div className="p-4 bg-background rounded-full shadow-sm">
            <PlusCircle className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold">まだボードがありません</h3>
            <p className="text-muted-foreground max-w-sm">
              「新しい芝を追加」ボタンから、学習や習慣の記録を開始しましょう。
            </p>
          </div>
          <CreateProjectDialog onProjectCreated={fetchProjectsAndLogs} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {projects.map((project) => (
            <ActivityBoard 
              key={project.id} 
              project={project} 
              activities={project.activities} 
              onUpdate={fetchProjectsAndLogs}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
