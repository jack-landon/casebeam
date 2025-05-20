"use client";

import { FormEvent, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createCategory } from "@/lib/db/queries/insert";
import { SelectCategory } from "@/lib/db/schema";
import { useCurrentModal } from "./providers/CurrentModalProvider";
import { useUserData } from "./providers/UserDataProvider";

type FormData = {
  name: string;
  description: string;
};

type FormFields = keyof FormData;

export function NewCategoryModal() {
  const { currentModal, setCurrentModal } = useCurrentModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<
    Pick<SelectCategory, "name" | "description">
  >({
    name: "",
    description: "",
  });
  const { userData, refreshUserData } = useUserData();

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

      await createCategory(formData);

      toast("Category created", {
        description: "Your new category has been successfully created.",
      });

      setFormData({
        name: "",
        description: "",
      });

      setCurrentModal(null);
      refreshUserData();
    } catch (error) {
      console.error("Error creating category:", error);
      toast("Error", {
        description:
          "There was an error creating the category. Please try again.",
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
    <Dialog open={currentModal == "newCategory"} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Save notes, case summaries and search results to this category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="mb-2" htmlFor="title">
                  Category Name
                </Label>
                <Input
                  id="title"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label className="mb-2" htmlFor="description">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description ?? ""}
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
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
