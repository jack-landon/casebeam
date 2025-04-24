"use client";

import { Button } from "@/components/ui/button";
import {
  BookText,
  Check,
  ChevronDown,
  Filter,
  Landmark,
  MapPin,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  colorList,
  DOC_JURISDICTIONS,
  DOC_SOURCES,
  DOC_TYPES,
  formatTag,
} from "@/lib/utils";
import { FilterOption } from "@/page";
import { Badge } from "./ui/badge";

export const filterIcons = {
  types: BookText,
  jurisdictions: MapPin,
  sources: Landmark,
} as const;

type FilterProps = {
  filters: FilterOption[];
  setFilters: React.Dispatch<React.SetStateAction<FilterOption[]>>;
  isCombinedButton?: boolean;
};

export default function Filters({
  filters,
  setFilters,
  isCombinedButton,
}: FilterProps) {
  return isCombinedButton ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Filter className="size-4 mr-2" />
          Filters <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="">
        <div className="flex flex-col gap-2 item p-1">
          <p className="underline font-bold mb-2">Filters</p>
          <FilterButtons filters={filters} setFilters={setFilters} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex items-center space-x-2 ml-2">
      <FilterButtons filters={filters} setFilters={setFilters} />
    </div>
  );
}

export function FilterButtons({ filters, setFilters }: FilterProps) {
  const isFilterActive = (
    key: FilterOption["key"],
    value: FilterOption["value"]
  ) => filters.some((f) => f.key === key && f.value === value);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="cursor-pointer">
            <filterIcons.types className="size-4 mr-2" />
            Category <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {DOC_TYPES.map((type, i) => (
            <DropdownMenuItem
              key={type}
              onClick={() => toggleFilter("types", type, setFilters)}
              className="flex items-center cursor-pointer"
            >
              {isFilterActive("types", type) ? (
                <div>
                  <Check className="size-3 mr-2" />
                </div>
              ) : (
                <div className={`w-3 h-3 rounded-full mr-2 ${colorList[i]}`} />
              )}
              <span>{formatTag(type)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="cursor-pointer">
            <filterIcons.jurisdictions className="size-4 mr-2" />
            Jurisdiction <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {DOC_JURISDICTIONS.map((jurisdiction, i) => (
            <DropdownMenuItem
              key={jurisdiction}
              onClick={() =>
                toggleFilter("jurisdictions", jurisdiction, setFilters)
              }
              className="flex items-center cursor-pointer"
            >
              {isFilterActive("jurisdictions", jurisdiction) ? (
                <div>
                  <Check className="size-3 mr-2" />
                </div>
              ) : (
                <div className={`w-3 h-3 rounded-full mr-2 ${colorList[i]}`} />
              )}
              <span>{formatTag(jurisdiction)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="cursor-pointer">
            <filterIcons.sources className="size-4 mr-2" />
            Source <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {DOC_SOURCES.map((source, i) => (
            <DropdownMenuItem
              key={source}
              onClick={() => toggleFilter("sources", source, setFilters)}
              className="flex items-center cursor-pointer"
            >
              {isFilterActive("sources", source) ? (
                <div>
                  <Check className="size-3 mr-2" />
                </div>
              ) : (
                <div className={`w-3 h-3 rounded-full mr-2 ${colorList[i]}`} />
              )}
              <span>{formatTag(source)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function FilterList({ filters, setFilters }: FilterProps) {
  return filters.map((filter, i) => {
    const FilterIcon = filterIcons[filter.key];
    return (
      <Badge key={i} variant="outline" className="group">
        <div className="relative w-3 h-3">
          <FilterIcon className="absolute inset-0 size-3 group-hover:opacity-0 transition-opacity" />
          <X
            className="absolute inset-0 size-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => toggleFilter(filter.key, filter.value, setFilters)}
          />
        </div>
        <span className="ml-1">{formatTag(filter.value)}</span>
      </Badge>
    );
  });
}

function toggleFilter(
  key: FilterOption["key"],
  value: FilterOption["value"],
  setFilters: React.Dispatch<React.SetStateAction<FilterOption[]>>
) {
  setFilters((current) => {
    const exists = current.some(
      (filter) => filter.key === key && filter.value === value
    );

    if (exists) {
      return current.filter(
        (filter) => !(filter.key === key && filter.value === value)
      );
    }

    return [...current, { key, value }];
  });
}
