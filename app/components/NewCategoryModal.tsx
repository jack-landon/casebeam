"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@clerk/nextjs";
import { createCategory } from "@/lib/db/queries/insert";
import { SelectCategory } from "@/lib/db/schema";

type FormData = {
  name: string;
  description: string;
};

type FormFields = keyof FormData;

export function NewCategoryModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { userId } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<
    Pick<SelectCategory, "name" | "description">
  >({
    name: "",
    description: "",
  });

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

      await createCategory(formData);

      toast("Category created", {
        description: "Your new category has been successfully created.",
      });

      setFormData({
        name: "",
        description: "",
      });

      onOpenChange(false);
      router.refresh();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onClick={() => onOpenChange(false)}
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
