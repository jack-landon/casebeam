import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import {
  HeartHandshake,
  LayoutDashboard,
  LogIn,
  Menu,
  MessageSquare,
  UserRoundPlus,
} from "lucide-react";

export default function MobileDrawerMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <Menu className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle>Navigation</DrawerTitle>
          {/* <DrawerDescription>
            Navigate through the app and access your account settings.
          </DrawerDescription> */}
        </DrawerHeader>

        <div className="my-3">
          <SignedIn>
            <div className="flex flex-col justify-center items-center gap-4 px-4">
              <div className="w-full grid grid-cols-2 gap-2">
                <Button
                  asChild
                  onClick={() => {
                    document.getElementById("close-mobile-drawer")?.click();
                  }}
                  variant="link"
                  className="px-2 py-1 cursor-pointer"
                >
                  <Link href="/dashboard" prefetch={false}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  asChild
                  onClick={() => {
                    document.getElementById("close-mobile-drawer")?.click();
                  }}
                  variant="link"
                  className="px-2 py-1 cursor-pointer"
                >
                  <Link href="/" prefetch={false}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Link>
                </Button>
              </div>
              <Button asChild className="w-full py-1 cursor-pointer">
                <Link href="https://casebeam.ai/feedback" target="_blank">
                  <HeartHandshake className="h-4 w-4 mr-2" /> Feedback
                </Link>
              </Button>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex flex-col justify-center items-center gap-4 px-4">
              <div className="w-full grid grid-cols-2 gap-2">
                <Button
                  asChild
                  onClick={() => {
                    document.getElementById("close-mobile-drawer")?.click();
                  }}
                  variant={"link"}
                  className="py-1 cursor-pointer"
                >
                  <Link href="/sign-in">
                    <LogIn className="h-4 w-4 mr-2" /> Login
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    document.getElementById("close-mobile-drawer")?.click();
                  }}
                  asChild
                  variant="link"
                  className="py-1 cursor-pointer"
                >
                  <Link href="/sign-up">
                    <UserRoundPlus className="h-4 w-4 mr-2" /> Sign Up
                  </Link>
                </Button>
              </div>
              <Button asChild className="w-full py-1 cursor-pointer">
                <Link href="https://casebeam.ai/feedback" target="_blank">
                  <HeartHandshake className="h-4 w-4 mr-2" /> Feedback
                </Link>
              </Button>
            </div>
          </SignedOut>
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button
              id="close-mobile-drawer"
              variant="outline"
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
