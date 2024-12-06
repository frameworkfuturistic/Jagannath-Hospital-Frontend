import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TodaySlotData } from "./types"
import { createTodaySlot } from "./api"

interface TodaySlotModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TodaySlotData) => void
  consultantId: number
}

export function TodaySlotModal({ isOpen, onClose, onSubmit, consultantId }: TodaySlotModalProps) {
  const [formData, setFormData] = useState<TodaySlotData>({
    consultant_id: consultantId,
    shift_id: 1,
    date: new Date().toISOString().split('T')[0],
    num_slots: 10
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'num_slots' ? parseInt(value) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createTodaySlot(formData)
      onSubmit(formData)
      onClose()
    } catch (error) {
      console.error("Error creating today's slot:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Today's Slots</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shift_id" className="text-right">
                Shift ID
              </Label>
              <Input
                id="shift_id"
                name="shift_id"
                type="number"
                value={formData.shift_id}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="num_slots" className="text-right">
                Number of Slots
              </Label>
              <Input
                id="num_slots"
                name="num_slots"
                type="number"
                value={formData.num_slots}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Slots"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
