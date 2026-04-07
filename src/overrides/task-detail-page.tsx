import type { TaskKey } from '@/lib/site-config'

export const TASK_DETAIL_PAGE_OVERRIDE_ENABLED = false

export async function TaskDetailPageOverride(_: { task: TaskKey; slug: string }) {
  return null
}
