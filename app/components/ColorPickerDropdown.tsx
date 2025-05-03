"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { colorList } from "@/lib/utils";

type Props = {
  color: (typeof colorList)[number];
  setColor: (color: (typeof colorList)[number]) => void;
};

export function ColorPickerDropdown({ color, setColor }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <div className={`w-4 h-4 rounded-full ${color}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select a color</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={color}
          onValueChange={setColor}
          className="cursor-pointer"
        >
          {colorList.map((color) => (
            <DropdownMenuRadioItem
              key={color}
              value={color}
              className="flex items-center space-x-1 font-bold cursor-pointer"
            >
              <div key={color} className={`w-4 h-4 rounded-full ${color}`} />
              <p>{color.split("-")[1].toUpperCase()}</p>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
