import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SlotRangeData } from "./types"
import { createSlotRange } from "./api"

interface SlotRangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SlotRangeData) => void
  consultantId: number
  consultantName: string
  consultantDepartment: string
}

export function SlotRangeModal({ isOpen, onClose, onSubmit, consultantId, consultantName, consultantDepartment }: SlotRangeModalProps) {
  const [formData, setFormData] = useState<SlotRangeData>({
    consultant_id: consultantId,
    start_date: '',
    end_date: '',
    interval_minutes: 5,
    daily_slots: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'interval_minutes' ? parseInt(value) : value }))
  }

  const handleDailySlotChange = (index: number, field: 'date' | 'num_slots', value: string) => {
    const updatedDailySlots = [...formData.daily_slots]
    updatedDailySlots[index] = {
      ...updatedDailySlots[index],
      [field]: field === 'num_slots' ? parseInt(value) : value
    }
    setFormData(prev => ({ ...prev, daily_slots: updatedDailySlots }))
  }

  const addDailySlot = () => {
    setFormData(prev => ({
      ...prev,
      daily_slots: [...prev.daily_slots, { date: '', num_slots: 0 }]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createSlotRange(formData)
      onSubmit(formData)
      onClose()
    } catch (error) {
      console.error("Error creating slot range:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Slot Range</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Doctor Details</h3>
          <p><strong>Name:</strong> {consultantName}</p>
          <p><strong>Department:</strong> {consultantDepartment}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">
                Start Date
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_date" className="text-right">
                End Date
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interval_minutes" className="text-right">
                Interval (minutes)
              </Label>
              <Input
                id="interval_minutes"
                name="interval_minutes"
                type="number"
                value={formData.interval_minutes}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            {formData.daily_slots.map((slot, index) => (
              <div key={index} className="grid grid-cols-4 items-center gap-4">
                <Input
                  type="date"
                  value={slot.date}
                  onChange={(e) => handleDailySlotChange(index, 'date', e.target.value)}
                  className="col-span-2"
                />
                <Input
                  type="number"
                  value={slot.num_slots}
                  onChange={(e) => handleDailySlotChange(index, 'num_slots', e.target.value)}
                  className="col-span-2"
                  placeholder="Number of slots"
                />
              </div>
            ))}
            <Button type="button" onClick={addDailySlot}>Add Daily Slot</Button>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Slot Range"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

