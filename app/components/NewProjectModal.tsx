"use client";

import { FormEvent, useState } from "react";
import { createProjectInDb, updateProjectInDb } from "@/lib/actions";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCurrentModal } from "./providers/CurrentModalProvider";
import { ProjectStatus } from "@/lib/db/schema";
import { useUserData } from "./providers/UserDataProvider";

type FormData = {
  name: string;
  caseNumber: string;
  client: string;
  caseType: string;
  status: ProjectStatus;
  court: string;
  judge: string;
  description: string;
};

type FormFields = keyof FormData;

type Props = {
  initialData?: FormData & { id: number };
  refreshPage?: () => void;
};

export function NewProjectModal({ initialData, refreshPage }: Props) {
  const { currentModal, setCurrentModal } = useCurrentModal();
  const { userData, refreshUserData } = useUserData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(
    initialData || {
      name: "",
      caseNumber: "",
      client: "",
      caseType: "",
      status: "active",
      court: "",
      judge: "",
      description: "",
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
      if (!userData?.id) return;

      if (initialData) {
        // Update existing project
        await updateProjectInDb(initialData.id, {
          ...formData,
          userId: userData.id,
        });

        if (refreshPage) refreshPage();

        toast("Project updated", {
          description: "Your case has been successfully updated.",
        });
      } else {
        await createProjectInDb({
          ...formData,
          userId: userData.id,
        });

        toast("Project created", {
          description: "Your new case has been successfully created.",
        });
      }

      refreshUserData();
      setCurrentModal(null);
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
            <DialogTitle>
              {initialData ? "Update" : "Create New"} Project
            </DialogTitle>
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
                <Label className="mb-2" htmlFor="caseNumber">
                  Case Number (Optional)
                </Label>
                <Input
                  id="caseNumber"
                  value={formData.caseNumber}
                  onChange={(e) => handleChange("caseNumber", e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="client">
                  Client (Optional)
                </Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => handleChange("client", e.target.value)}
                />
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
              {initialData && isSubmitting
                ? "Updating..."
                : initialData
                ? "Update Project"
                : isSubmitting
                ? "Creating..."
                : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
