// Typed repository for the agent_tasks domain.

import { supabase } from '../supabase';
import { AgentTask } from '../../types';
import { mockAgentTasks } from '../../src/data/mockData';
import { RepoReadResult, RepoWriteResult, okRead, errRead, okWrite, errWrite, DataSource } from './types';

// ---- mappers ----

interface AgentTaskRow {
  id: string;
  user_id: string;
  title: string;
  status: AgentTask['status'];
  output: string | null;
  created_at: string;
}

function mapAgentTask(r: AgentTaskRow): AgentTask {
  return {
    id: r.id,
    title: r.title,
    status: r.status,
    output: r.output ?? undefined,
  };
}

// ---- public API ----

export async function fetchAgentTasks(): Promise<RepoReadResult<AgentTask>> {
  const { data, error } = await supabase
    .from('agent_tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return errRead<AgentTask>(error.message, 'supabase');
  }

  const mapped = (data as AgentTaskRow[]).map(mapAgentTask);
  return okRead(mapped, 'supabase');
}

export async function createAgentTask(
  task: AgentTask,
  userId: string,
  source: DataSource
): Promise<RepoWriteResult<AgentTask>> {
  if (source === 'local') {
    return okWrite(task, 'local');
  }

  const { data, error } = await supabase
    .from('agent_tasks')
    .insert({
      user_id: userId,
      title: task.title,
      status: task.status,
      output: task.output ?? null,
    })
    .select()
    .single();

  if (error) {
    return errWrite<AgentTask>(error.message, 'supabase');
  }

  return okWrite(mapAgentTask(data as AgentTaskRow), 'supabase');
}

// Fallback: return mock agent tasks when not authenticated
export function localAgentTasks(): RepoReadResult<AgentTask> {
  return okRead(mockAgentTasks, 'local');
}
