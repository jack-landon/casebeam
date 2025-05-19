"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectInDb } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import { useAuth } from "@clerk/nextjs";
import { useCurrentModal } from "./providers/CurrentModalProvider";
import { ProjectStatus } from "@/lib/db/schema";

type FormData = {
  name: string;
  caseNumber: string;
  client: string;
  caseType: string;
  status: ProjectStatus;
  filingDate: Date;
  court: string;
  judge: string;
  description: string;
  nextDeadline: Date | null;
};

type FormFields = keyof FormData;

type Props = {
  initialData?: FormData;
};

export function NewProjectModal({ initialData }: Props) {
  const { currentModal, setCurrentModal } = useCurrentModal();
  const { userId } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(
    initialData || {
      name: "",
      caseNumber: "",
      client: "",
      caseType: "",
      status: "active",
      filingDate: new Date(),
      court: "",
      judge: "",
      description: "",
      nextDeadline: null,
    }
  );

  const handleChange = (field: string, value: FormData[FormFields]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!userId) return;

      // Format dates for database
      const formattedData = {
        ...formData,
        filingDate: formData.filingDate.toISOString().split("T")[0],
        nextDeadline: formData.nextDeadline
          ? dayjs(formData.nextDeadline).format("MMM DD, YYYY")
          : null,
      };

      await createProjectInDb({
        ...formattedData,
        userId,
      });

      toast("Project created", {
        description: "Your new case has been successfully created.",
      });

      setCurrentModal(null);
      await router.refresh();
    } catch (error) {
      console.error("Error creating case:", error);
      toast("Error", {
        description: "There was an error creating your case. Please try again.",
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  function onOpenChange() {
    setCurrentModal(null);
  }

  return (
    <Dialog open={currentModal == "newProject"} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter the details for the new legal case.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="mb-2" htmlFor="title">
                  Project Title
                </Label>
                <Input
                  id="title"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="caseNumber">
                  Case Number
                </Label>
                <Input
                  id="caseNumber"
                  value={formData.caseNumber}
                  onChange={(e) => handleChange("caseNumber", e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="client">
                  Client
                </Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => handleChange("client", e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="caseType">
                  Project Type
                </Label>
                <Select
                  value={formData.caseType}
                  onValueChange={(value) => handleChange("caseType", value)}
                >
                  <SelectTrigger className="cursor-pointer" id="caseType">
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      className="cursor-pointer"
                      value="Civil Litigation"
                    >
                      Civil Litigation
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="Family Law">
                      Family Law
                    </SelectItem>
                    <SelectItem
                      className="cursor-pointer"
                      value="Criminal Defense"
                    >
                      Criminal Defense
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="Probate">
                      Probate
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="Business Law">
                      Business Law
                    </SelectItem>
                    <SelectItem
                      className="cursor-pointer"
                      value="Intellectual Property"
                    >
                      Intellectual Property
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="Real Estate">
                      Real Estate
                    </SelectItem>
                    <SelectItem
                      className="cursor-pointer"
                      value="Medical Litigation"
                    >
                      Medical Litigation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2" htmlFor="status">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger className="cursor-pointer" id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="cursor-pointer" value="active">
                      Active
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="pending">
                      Pending
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="closed">
                      Closed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2" htmlFor="filingDate">
                  Filing Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal cursor-pointer",
                        !formData.filingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.filingDate ? (
                        dayjs(formData.filingDate).format("MMM D, YYYY")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.filingDate}
                      onSelect={(date) =>
                        date && handleChange("filingDate", date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="mb-2" htmlFor="nextDeadline">
                  Next Deadline (Optional)
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal cursor-pointer",
                        !formData.nextDeadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.nextDeadline ? (
                        dayjs(formData.nextDeadline).format("MMM D, YYYY")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.nextDeadline ?? undefined}
                      onSelect={(date) =>
                        date && handleChange("nextDeadline", date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="mb-2" htmlFor="court">
                  Court (Optional)
                </Label>
                <Input
                  id="court"
                  value={formData.court}
                  onChange={(e) => handleChange("court", e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="judge">
                  Judge (Optional)
                </Label>
                <Input
                  id="judge"
                  value={formData.judge}
                  onChange={(e) => handleChange("judge", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label className="mb-2" htmlFor="description">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              onClick={() => setCurrentModal(null)}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
