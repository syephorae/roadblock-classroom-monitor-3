'use client';

import { useState, useTransition } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getRecommendations } from '@/lib/actions';
import type { Student } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function RecommendationsButton({ student }: { student: Student }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [recommendations, setRecommendations] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = () => {
    startTransition(async () => {
      setError(null);
      setRecommendations(null);
      const result = await getRecommendations({
        studentId: student.id,
        progress: student.progress,
        timePlayed: student.timePlayed,
        experimentScore: student.experimentScore,
        activityScore: student.activityScore,
      });

      if (result.success) {
        setRecommendations(result.data);
      } else {
        setError(result.error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="mr-2 h-4 w-4" />
          Get AI Tips
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Recommendations for {student.name}</DialogTitle>
          <DialogDescription>
            Personalized suggestions based on student's performance data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isPending && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && !isPending && (
            <Alert variant="destructive">
              <AlertTitle>Failed to get recommendations</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {recommendations && !isPending && (
            <ul className="space-y-2 list-disc list-inside bg-secondary p-4 rounded-md">
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          )}
          {!recommendations && !isPending && (
            <div className="text-center text-muted-foreground p-4">
              Click the button below to generate AI-powered recommendations.
            </div>
          )}
          <Button
            onClick={handleGenerate}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Recommendations'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
