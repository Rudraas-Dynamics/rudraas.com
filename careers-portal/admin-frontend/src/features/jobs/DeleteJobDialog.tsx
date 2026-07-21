import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteJob, jobsQueryKey } from '@/features/jobs/jobs-api'
import type { Job } from '@/features/jobs/types'

interface DeleteJobDialogProps {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function DeleteJobDialog({ job, open, onOpenChange, onDeleted }: DeleteJobDialogProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => deleteJob(job._id),
    onSuccess: async () => {
      toast.success('Job deleted')
      await queryClient.invalidateQueries({ queryKey: jobsQueryKey })
      onOpenChange(false)
      onDeleted?.()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete job'))
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete "{job.title}"?</DialogTitle>
          <DialogDescription>
            This permanently removes the job requisition. Jobs that already have candidate applications
            cannot be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Delete job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
