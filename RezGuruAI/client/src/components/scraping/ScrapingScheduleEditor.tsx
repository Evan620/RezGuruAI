import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ScrapingScheduleEditorProps {
  jobId: number;
  onComplete: () => void;
}

type ScheduleType = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'custom';

interface ScheduleData {
  type: ScheduleType;
  time: string;
  days: string[];
  dates: string[];
  dayOfMonth: string;
  customCron?: string;
}

export default function ScrapingScheduleEditor({ jobId, onComplete }: ScrapingScheduleEditorProps) {
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [scheduleTime, setScheduleTime] = useState<string>('09:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['mon', 'wed', 'fri']);
  const [dayOfMonth, setDayOfMonth] = useState<string>('1');
  const [customCron, setCustomCron] = useState<string>('0 9 * * 1-5');
  
  const daysOfWeek = [
    { id: 'mon', label: 'Mon' },
    { id: 'tue', label: 'Tue' },
    { id: 'wed', label: 'Wed' },
    { id: 'thu', label: 'Thu' },
    { id: 'fri', label: 'Fri' },
    { id: 'sat', label: 'Sat' },
    { id: 'sun', label: 'Sun' },
  ];
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const scheduleJobMutation = useMutation({
    mutationFn: async (scheduleData: ScheduleData) => {
      return apiRequest(`/api/scraping-jobs/${jobId}/schedule`, 'POST', scheduleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scraping-jobs'] });
      toast({
        title: 'Schedule Set',
        description: 'The scraping job has been scheduled successfully.',
      });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to schedule scraping job: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };
  
  const getScheduleDescription = (): string => {
    switch (scheduleType) {
      case 'one-time':
        return `Once on today at ${scheduleTime}`;
      case 'daily':
        return `Every day at ${scheduleTime}`;
      case 'weekly':
        const dayNames = selectedDays.map(day => {
          const dayObj = daysOfWeek.find(d => d.id === day);
          return dayObj?.label || day;
        }).join(', ');
        return `Every ${dayNames} at ${scheduleTime}`;
      case 'monthly':
        return `Monthly on day ${dayOfMonth} at ${scheduleTime}`;
      case 'custom':
        return `Custom schedule: ${customCron}`;
      default:
        return '';
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduleData: ScheduleData = {
      type: scheduleType,
      time: scheduleTime,
      days: selectedDays,
      dates: [],
      dayOfMonth,
      customCron: scheduleType === 'custom' ? customCron : undefined
    };
    
    scheduleJobMutation.mutate(scheduleData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <RadioGroup 
            value={scheduleType} 
            onValueChange={(value) => setScheduleType(value as ScheduleType)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="one-time" id="one-time" />
              <Label htmlFor="one-time">Run once</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily">Run daily</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly">Run weekly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly">Run monthly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom cron schedule</Label>
            </div>
          </RadioGroup>
        </div>
        
        {scheduleType !== 'custom' && (
          <div className="grid gap-2">
            <Label htmlFor="time">Time of day</Label>
            <Input
              id="time"
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </div>
        )}
        
        {scheduleType === 'weekly' && (
          <div className="grid gap-2">
            <Label>Days of week</Label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`day-${day.id}`} 
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                  />
                  <Label htmlFor={`day-${day.id}`}>{day.label}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {scheduleType === 'monthly' && (
          <div className="grid gap-2">
            <Label htmlFor="dayOfMonth">Day of month</Label>
            <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {scheduleType === 'custom' && (
          <div className="grid gap-2">
            <Label htmlFor="cronExpression">Cron Expression</Label>
            <Input
              id="cronExpression"
              value={customCron}
              onChange={(e) => setCustomCron(e.target.value)}
              placeholder="0 9 * * 1-5"
            />
            <p className="text-sm text-muted-foreground">
              Use cron syntax: minute hour day-of-month month day-of-week
            </p>
          </div>
        )}
        
        <div className="rounded-md bg-muted p-3">
          <p className="text-sm font-medium">Schedule Summary</p>
          <p className="text-sm text-muted-foreground">{getScheduleDescription()}</p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit" disabled={scheduleJobMutation.isPending}>
          {scheduleJobMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : 'Save Schedule'}
        </Button>
      </div>
    </form>
  );
}