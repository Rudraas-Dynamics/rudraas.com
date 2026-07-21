import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api-client'
import {
  archiveJob,
  closeJob,
  duplicateJob,
  jobsQueryKey,
  publishJob,
  setJobUrgent,
} from '@/features/jobs/jobs-api'
import type { Job } from '@/features/jobs/types'

export function useJobActionMutations(job: Job) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: jobsQueryKey })
  }

  const publishMutation = useMutation({
    mutationFn: () => publishJob(job._id),
    onSuccess: async () => {
      toast.success('Job published')
      await invalidate()
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to publish job')),
  })

  const closeMutation = useMutation({
    mutationFn: () => closeJob(job._id),
    onSuccess: async () => {
      toast.success('Job closed')
      await invalidate()
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to close job')),
  })

  const archiveMutation = useMutation({
    mutationFn: () => archiveJob(job._id),
    onSuccess: async () => {
      toast.success('Job archived')
      await invalidate()
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to archive job')),
  })

  const urgentMutation = useMutation({
    mutationFn: () => setJobUrgent(job._id, !job.isUrgent),
    onSuccess: async () => {
      toast.success(job.isUrgent ? 'Removed urgent flag' : 'Marked as urgent')
      await invalidate()
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update job')),
  })

  const duplicateMutation = useMutation({
    mutationFn: () => duplicateJob(job._id),
    onSuccess: async (result) => {
      toast.success('Job duplicated as a draft')
      await invalidate()
      navigate(`/jobs/${result.data._id}`)
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to duplicate job')),
  })

  return { publishMutation, closeMutation, archiveMutation, urgentMutation, duplicateMutation }
}
