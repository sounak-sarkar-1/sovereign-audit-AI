import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const assessmentSteps = [
  {
    category: "Objectivity & Independence",
    questions: [
      "I have disclosed all potential conflicts of interest for my current assignments.",
      "I have maintained an objective mental attitude throughout the audit process.",
      "No undue influence has been exerted on my professional judgment."
    ]
  },
  {
    category: "Evidence & Documentation",
    questions: [
      "All findings are supported by sufficient, reliable, and relevant evidence.",
      "Workpapers are organized and follow the standard documentation protocol.",
      "Evidence files have been correctly linked to their respective line items."
    ]
  },
  {
    category: "Compliance & Risk",
    questions: [
      "I have considered all applicable laws and regulations in my testing.",
      "High-risk areas identified in the scope have received prioritized attention.",
      "Exceptions have been raised promptly upon discovery of non-compliance."
    ]
  }
];

const AuditorSelfAssessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalQuestions = assessmentSteps.reduce((acc, step) => acc + step.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleToggle = (question: string) => {
    setAnswers(prev => ({
      ...prev,
      [question]: !prev[question]
    }));
  };

  const handleNext = () => {
    if (currentStep < assessmentSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (answeredCount < totalQuestions) {
        toast.warning("Please complete all check items before submitting.");
        return;
      }
      setIsSubmitted(true);
      toast.success("Self-assessment submitted successfully!");
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-md w-full shadow-elevated border-none text-center p-8 space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <CheckCircle size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-dark">Assessment Complete</h3>
            <p className="text-sm text-muted-foreground">
              Your self-assessment has been recorded and will be shared with your Audit Manager during the final review.
            </p>
          </div>
          <Button 
            className="w-full rounded-full bg-primary"
            onClick={() => setIsSubmitted(false)}
          >
            Start New Assessment
          </Button>
        </Card>
      </div>
    );
  }

  const currentCategory = assessmentSteps[currentStep];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold">
               <ShieldCheck size={20} />
               <h2 className="text-xl">Quality Assurance Self-Assessment</h2>
            </div>
            <p className="text-sm text-muted-foreground">Internal quality check to ensure audit integrity and design system compliance.</p>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Step {currentStep + 1} of {assessmentSteps.length}
          </p>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <Card className="shadow-card border-none bg-white overflow-hidden">
        <CardHeader className="bg-muted/30 border-b p-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-primary/10 text-primary`}>
               {currentStep === 0 && <ClipboardCheck size={20} />}
               {currentStep === 1 && <FileSearch size={20} />}
               {currentStep === 2 && <AlertTriangle size={20} />}
            </div>
            <div>
              <CardTitle className="text-lg">{currentCategory.category}</CardTitle>
              <CardDescription>Confirm your adherence to professional standards</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          {currentCategory.questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleToggle(q)}
              className={cn(
                "w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 group",
                answers[q] 
                  ? "bg-primary/5 border-primary shadow-sm" 
                  : "bg-white border-bg-mid hover:border-primary/50"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                answers[q] ? "bg-primary text-white" : "bg-muted/10 text-muted-foreground group-hover:text-primary"
              )}>
                {answers[q] ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </div>
              <span className={cn(
                "text-sm font-medium",
                answers[q] ? "text-dark" : "text-muted-foreground"
              )}>
                {q}
              </span>
            </button>
          ))}
        </CardContent>
        <CardFooter className="p-6 bg-muted/10 border-t flex justify-between">
          <Button 
            variant="ghost" 
            className="rounded-full gap-2"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
          >
            <ArrowLeft size={16} /> Previous
          </Button>
          <Button 
            className="rounded-full gap-2 bg-primary hover:bg-primary/90 min-w-[120px]"
            onClick={handleNext}
          >
            {currentStep === assessmentSteps.length - 1 ? 'Submit Assessment' : 'Next Category'}
            <ArrowRight size={16} />
          </Button>
        </CardFooter>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800">
         <AlertTriangle size={20} className="shrink-0 mt-0.5" />
         <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider">Professional Integrity Notice</p>
            <p className="text-xs">
              Completion of this self-assessment is mandatory before submitting any final audit report. 
              False declarations may result in disciplinary review of professional conduct.
            </p>
         </div>
      </div>
    </div>
  );
};

export default AuditorSelfAssessment;
