import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useBoardStore } from '../../store/boardStore';
import type { TaskStatus } from '../../types/board';

export const AnalyticsPage: React.FC = () => {
  const { tasks } = useBoardStore();

  // 1. Sprint Velocity Data (Dynamic based on task ID mapping)
  // Sprint 1: tasks 1-8, Sprint 2: tasks 9-16, Sprint 3: tasks 17-24, Sprint 4: tasks 25+
  const sprintData = useMemo(() => {
    const sprints = [
      { name: 'Sprint 1', completed: 0, total: 0 },
      { name: 'Sprint 2', completed: 0, total: 0 },
      { name: 'Sprint 3', completed: 0, total: 0 },
      { name: 'Sprint 4', completed: 0, total: 0 },
    ];

    tasks.forEach((task) => {
      let sprintIndex = 3; // Default Sprint 4 for custom tasks
      const numId = parseInt(task.id.replace(/\D/g, ''), 10);
      
      if (!isNaN(numId)) {
        if (numId <= 8) sprintIndex = 0;
        else if (numId <= 16) sprintIndex = 1;
        else if (numId <= 24) sprintIndex = 2;
      }

      sprints[sprintIndex].total += 1;
      if (task.status === 'done') {
        sprints[sprintIndex].completed += 1;
      }
    });

    return sprints;
  }, [tasks]);

  // 2. Task Status Distribution (Donut Chart)
  const statusData = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      backlog: 0,
      'in-progress': 0,
      review: 0,
      done: 0,
    };

    tasks.forEach((task) => {
      counts[task.status] += 1;
    });

    return [
      { name: 'Backlog', value: counts.backlog, color: '#94a3b8' }, // Slate
      { name: 'In Progress', value: counts['in-progress'], color: '#3b82f6' }, // Blue
      { name: 'Review', value: counts.review, color: '#f59e0b' }, // Amber
      { name: 'Done', value: counts.done, color: '#10b981' }, // Emerald
    ].filter(item => item.value > 0); // only show populated categories
  }, [tasks]);

  // 3. Priority Breakdown across columns (Stacked Bar Chart)
  const priorityData = useMemo(() => {
    const cols: Record<TaskStatus, { name: string; Low: number; Medium: number; High: number }> = {
      backlog: { name: 'Backlog', Low: 0, Medium: 0, High: 0 },
      'in-progress': { name: 'In Progress', Low: 0, Medium: 0, High: 0 },
      review: { name: 'Review', Low: 0, Medium: 0, High: 0 },
      done: { name: 'Done', Low: 0, Medium: 0, High: 0 },
    };

    tasks.forEach((task) => {
      const col = cols[task.status];
      if (col) {
        if (task.priority === 'low') col.Low += 1;
        else if (task.priority === 'medium') col.Medium += 1;
        else if (task.priority === 'high') col.High += 1;
      }
    });

    return Object.values(cols);
  }, [tasks]);

  // 4. Completion Trend (Line Chart showing cumulative completions over time)
  const trendData = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.status === 'done');
    
    // Sort completed tasks by due date
    const sortedCompleted = [...completedTasks].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    // Group completions by date
    const dateCounts: Record<string, number> = {};
    sortedCompleted.forEach((task) => {
      dateCounts[task.dueDate] = (dateCounts[task.dueDate] || 0) + 1;
    });

    // Generate cumulative trend
    let cumulative = 0;
    const dates = Object.keys(dateCounts).sort();
    
    const chartData = dates.map((date) => {
      cumulative += dateCounts[date];
      return {
        date: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        Completions: cumulative,
      };
    });

    // Provide default starting point if empty
    if (chartData.length === 0) {
      return [{ date: 'No Data', Completions: 0 }];
    }

    return chartData;
  }, [tasks]);

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Metrics Card Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
          <p className="text-3xl font-extrabold mt-1 text-slate-900 dark:text-slate-50">{tasks.length}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasks Done</p>
          <p className="text-3xl font-extrabold mt-1 text-emerald-500">
            {tasks.filter((t) => t.status === 'done').length}
          </p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
          <p className="text-3xl font-extrabold mt-1 text-blue-500">
            {tasks.filter((t) => t.status === 'in-progress').length}
          </p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</p>
          <p className="text-3xl font-extrabold mt-1 text-violet-500">
            {tasks.length > 0
              ? `${Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)}%`
              : '0%'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sprint Velocity */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Sprint Velocity</h3>
            <p className="text-xs text-slate-400">Completed tasks vs total sprint tasks</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sprintData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800/40" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="completed" name="Completed Tasks" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" name="Total Tasks" fill="#e2e8f0" radius={[4, 4, 0, 0]} className="dark:fill-slate-800" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Task Distribution</h3>
            <p className="text-xs text-slate-400">Proportion of tasks in each board column</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No board data available</span>
            )}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Priority Breakdown</h3>
            <p className="text-xs text-slate-400">Priority distribution per board column</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800/40" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Low" stackId="a" fill="#60a5fa" />
                <Bar dataKey="Medium" stackId="a" fill="#fbbf24" />
                <Bar dataKey="High" stackId="a" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Trend */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Completion Trend</h3>
            <p className="text-xs text-slate-400">Cumulative task completions over time</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800/40" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="Completions"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  activeDot={{ r: 6 }}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
