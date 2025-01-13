import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TodaySlotData } from './types';
import { createTodaySlot } from './api';

interface TodaySlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TodaySlotData) => void;
  consultantId: number;
  consultantName: string;
  consultantDepartment: string;
}

export function TodaySlotModal({
  isOpen,
  onClose,
  onSubmit,
  consultantId,
  consultantName,
  consultantDepartment,
}: TodaySlotModalProps) {
  const [formData, setFormData] = useState<TodaySlotData>({
    consultant_id: consultantId,
    shift_id: 2,
    date: new Date().toISOString().split('T')[0],
    num_slots: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'num_slots' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        consultant_id: consultantId,
      };
      await createTodaySlot(dataToSubmit);
      onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      console.error("Error creating today's slot:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Today's Slots</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Doctor Details</h3>
          <p>
            <strong>Name:</strong> {consultantName}
          </p>
          <p>
            <strong>Department:</strong> {consultantDepartment}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* <div className="grid grid-cols-4 items-center gap-4">
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
            </div> */}
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
              {isSubmitting ? 'Adding...' : 'Add Slots'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
