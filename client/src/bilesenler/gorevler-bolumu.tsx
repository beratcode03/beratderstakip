// BERAT CANKIR
// BERAT BİLAL CANKIR
// CANKIR


import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Undo2, Calendar, CheckCircle2, Archive, ArchiveRestore } from "lucide-react";
import { Task } from "@shared/sema";
import { apiRequest, sorguIstemcisi } from "@/kutuphane/sorguIstemcisi";
import { Button } from "@/bilesenler/arayuz/button";
import { useToast } from "@/hooks/use-toast";
import { EditTaskModal } from "@/bilesenler/gorev-duzenle-modal";
import { MidnightCountdown } from "@/bilesenler/geceyarisi-geri-sayim";

interface TasksSectionProps {
  onAddTask: () => void;
}

export function TasksSection({ onAddTask }: TasksSectionProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "high" | "weekly" | "monthly" | "archived">("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: archivedTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/archived"],
    enabled: filter === "archived",
  });

  const { data: dateRangeTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/by-date-range", startDate, endDate],
    queryFn: () => fetch(`/api/tasks/by-date-range?startDate=${startDate}&endDate=${endDate}`).then(res => res.json()),
    enabled: showDateRangePicker && !!startDate && !!endDate,
  });

  const archiveTaskMutation = useMutation({
    mutationFn: (taskId: string) => 
      apiRequest("PATCH", `/api/tasks/${taskId}/archive`),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/tasks"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/tasks/archived"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({
        title: "Görev arşivlendi",
        description: "Görev başarıyla arşivlendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Görev arşivlenemedi.",
        variant: "destructive",
      });
    },
  });

  const unarchiveTaskMutation = useMutation({
    mutationFn: (taskId: string) => 
      apiRequest("PATCH", `/api/tasks/${taskId}/unarchive`),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/tasks"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/tasks/archived"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({
        title: "Görev geri yüklendi",
        description: "Görev arşivden başarıyla geri yüklendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Görev geri yüklenemedi.",
        variant: "destructive",
      });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (taskId: string) => 
      apiRequest("PATCH", `/api/tasks/${taskId}/toggle`),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/tasks"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({
        title: "Görev güncellendi",
        description: "Görev durumu başarıyla değiştirildi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Görev durumu değiştirilemedi.",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => 
      apiRequest("DELETE", `/api/tasks/${taskId}`),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/tasks"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({
        title: "Görev silindi",
        description: "Görev başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Görev silinemedi.",
        variant: "destructive",
      });
    },
  });

  const displayTasks = showDateRangePicker && startDate && endDate ? dateRangeTasks : 
                       filter === "archived" ? archivedTasks : tasks;

  const filteredTasks = displayTasks.filter(task => {
    if (filter === "archived") return true;
    switch (filter) {
      case "pending":
        return !task.completed;
      case "completed":
        return task.completed;
      case "high":
        return task.priority === "high";
      case "weekly":
        return task.recurrenceType === "weekly";
      case "monthly":
        return task.recurrenceType === "monthly";
      default:
        return true;
    }
  });

  const getTaskBorderStyle = (task: Task) => {
    const color = task.color || "#8B5CF6"; // Renk yoksa varsayılan olarak mor
    return {
      borderLeft: `4px solid ${color}`,
    };
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "";
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "genel":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "turkce":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "sosyal":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "matematik":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "fizik":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "kimya":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      case "biyoloji":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "ayt-matematik":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300";
      case "ayt-fizik":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-300";
      case "ayt-kimya":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 border border-pink-300";
      case "ayt-biyoloji":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-300";
      default:
        return "";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Yüksek Öncelik";
      case "medium":
        return "Orta Öncelik";
      case "low":
        return "Düşük Öncelik";
      default:
        return "";
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "genel":
        return "Genel";
      case "turkce":
        return "Türkçe";
      case "sosyal":
        return "Sosyal Bilimler";
      case "matematik":
        return "Matematik";
      case "fizik":
        return "Fizik";
      case "kimya":
        return "Kimya";
      case "biyoloji":
        return "Biyoloji";
      case "tyt-geometri":
        return "TYT Geometri";
      case "ayt-geometri":
        return "AYT Geometri";
      case "ayt-matematik":
        return "Matematik";
      case "ayt-fizik":
        return "Fizik";
      case "ayt-kimya":
        return "Kimya";
      case "ayt-biyoloji":
        return "Biyoloji";
      default:
        return "";
    }
  };

  const formatDueDate = (dueDate: string) => {
    if (!dueDate) return "";
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Bugün";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Yarın";
    } else {
      return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
    }
  };

  const handleToggleTask = (taskId: string) => {
    toggleTaskMutation.mutate(taskId);
  };

  const handleArchiveTask = (taskId: string) => {
    archiveTaskMutation.mutate(taskId);
  };

  const handleUnarchiveTask = (taskId: string) => {
    unarchiveTaskMutation.mutate(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleDateRangeSearch = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Uyarı",
        description: "Lütfen başlangıç ve bitiş tarihlerini seçin.",
        variant: "destructive",
      });
      return;
    }
    setShowDateRangePicker(true);
  };

  const clearDateRange = () => {
    setStartDate("");
    setEndDate("");
    setShowDateRangePicker(false);
  };

  return (
    <div className="space-y-6">
      {/* Görev Ekle başlığı */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-foreground">Görevlerim</h2>
          <p className="text-muted-foreground">Bugün tamamlanacak görevler</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <Button 
            onClick={onAddTask}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-add-task"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Görev
          </Button>
          <MidnightCountdown />
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
          data-testid="filter-all"
        >
          Tümü
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === "pending"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
          data-testid="filter-pending"
        >
          Bekleyen
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === "completed"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
          data-testid="filter-completed"
        >
          Tamamlanan
        </button>
        <button
          onClick={() => setFilter("high")}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === "high"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
          data-testid="filter-high-priority"
        >
          Yüksek Öncelik
        </button>
        <button
          onClick={() => setFilter("weekly")}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === "weekly"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
          data-testid="filter-weekly"
        >
          📅 Haftalık
        </button>
        <button
          onClick={() => setFilter("monthly")}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === "monthly"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
          data-testid="filter-monthly"
        >
          🗓️ Aylık
        </button>
        <button
          onClick={() => { setFilter("archived"); clearDateRange(); }}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === "archived"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
          data-testid="filter-archived"
        >
          <Archive className="h-3 w-3 inline mr-1" />
          Arşiv
        </button>
      </div>

      {/* Tarih Aralığı Seçici - Only show when Archive filter is active */}
      {filter === "archived" && (
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground w-full sm:w-auto"
              placeholder="Başlangıç Tarihi"
              data-testid="input-start-date"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground w-full sm:w-auto"
              placeholder="Görevin Bitirilme Tarihi"
              data-testid="input-end-date"
            />
            <Button
              onClick={handleDateRangeSearch}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              data-testid="button-search-date-range"
            >
              Ara
            </Button>
            {showDateRangePicker && (
              <Button
                onClick={clearDateRange}
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto"
                data-testid="button-clear-date-range"
              >
                Temizle
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Görev Listesi */}
      <div className={`space-y-3 ${filteredTasks.length > 5 ? 'max-h-[600px] overflow-y-auto custom-scrollbar' : ''}`}>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Görev bulunamadı.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-card rounded-lg border border-border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${task.completed ? "opacity-75" : ""}`}
              style={getTaskBorderStyle(task)}
              data-testid={`task-item-${task.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    onClick={() => !task.archived && handleToggleTask(task.id)}
                    disabled={task.archived}
                    className={`mt-1 w-5 h-5 rounded-full border-2 transition-colors duration-200 flex items-center justify-center ${
                      task.completed
                        ? "bg-green-500 border-green-500"
                        : "hover:opacity-80"
                    } ${task.archived ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
                    style={{
                      borderColor: task.completed ? '#10B981' : (task.color || '#8B5CF6'),
                      backgroundColor: task.completed ? '#10B981' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!task.completed && !task.archived) {
                        e.currentTarget.style.backgroundColor = task.color || '#8B5CF6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!task.completed && !task.archived) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    data-testid={`button-toggle-task-${task.id}`}
                  >
                    {task.completed && (
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3
                      className={`font-medium text-foreground ${
                        task.completed ? "line-through" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p
                        className={`text-sm text-muted-foreground mt-1 ${
                          task.completed ? "line-through" : ""
                        }`}
                      >
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDueDate(task.dueDate)}
                        </span>
                      )}
                      {task.completed ? (
                        <span className="text-xs text-muted-foreground flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Tamamlandı
                        </span>
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeClass(
                            task.priority
                          )}`}
                        >
                          {getPriorityText(task.priority)}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getCategoryBadgeClass(
                          task.category
                        )}`}
                      >
                        {getCategoryText(task.category)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {task.completed ? (
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      data-testid={`button-undo-task-${task.id}`}
                    >
                      <Undo2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ) : !task.archived && (
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      data-testid={`button-edit-task-${task.id}`}
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                  {!task.archived ? (
                    <>
                      <button
                        onClick={() => handleArchiveTask(task.id)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        data-testid={`button-archive-task-${task.id}`}
                      >
                        <Archive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        data-testid={`button-delete-task-${task.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        data-testid={`button-edit-archived-task-${task.id}`}
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleUnarchiveTask(task.id)}
                        className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        data-testid={`button-unarchive-task-${task.id}`}
                      >
                        <ArchiveRestore className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </button>
                      <span className="text-xs text-muted-foreground px-2">Arşivlendi</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Görev Modalını Düzenle */}
      <EditTaskModal 
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        task={editingTask}
      />
    </div>
  );
}



