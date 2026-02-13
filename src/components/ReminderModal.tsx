import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Reminder {
  id: string;
  title: string;
  date: Date;
  time: string;
  notes: string;
}

interface ReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (reminder: Reminder) => void;
}

const ReminderModal = ({ open, onOpenChange, onSave }: ReminderModalProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("08:00");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!title || !date) return;
    onSave({
      id: crypto.randomUUID(),
      title,
      date,
      time,
      notes,
    });
    setTitle("");
    setDate(undefined);
    setTime("08:00");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[hsl(270,30%,12%)] border-pink-400/30 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Add Reminder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-white/80">Title</Label>
            <Input
              placeholder="e.g. Take Levothyroxine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-pink-400/30 text-white placeholder:text-white/40 focus-visible:ring-pink-400/50"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-white/80">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white/5 border-pink-400/30 hover:bg-white/10 hover:text-white",
                    !date && "text-white/40"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-pink-300" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[hsl(270,30%,15%)] border-pink-400/30" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label className="text-white/80">Time</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-white/5 border-pink-400/30 text-white focus-visible:ring-pink-400/50"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-white/80">Notes (optional)</Label>
            <Textarea
              placeholder="Any additional notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/5 border-pink-400/30 text-white placeholder:text-white/40 focus-visible:ring-pink-400/50 min-h-[60px]"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={!title || !date}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-[0_0_20px_hsl(330,80%,50%,0.4)] hover:shadow-[0_0_30px_hsl(330,80%,50%,0.6)] transition-all duration-300"
          >
            Save Reminder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderModal;
