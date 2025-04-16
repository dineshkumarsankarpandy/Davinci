import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
//   DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface RegenerateDesignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  initialPrompt?: string;
}

const RegenerateDesignDialog: React.FC<RegenerateDesignDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialPrompt = ''
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Regenerate Design</DialogTitle>
          <DialogDescription>
            Provide specific instructions for how you want the design to be modified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prompt" className="text-right">
                Design Prompt
              </Label>
              <Input
                id="prompt"
                className="col-span-3"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how you want to regenerate the design..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Regenerate'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegenerateDesignDialog;