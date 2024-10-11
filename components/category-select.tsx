import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const expenseCategories = [
  'Operational Costs',
  'Payroll and Employee Benefits',
  'Travel and Entertainment',
  'Marketing and Advertising',
  'Professional Services',
  'Technology and Software',
  'Inventory and Supplies',
  'Insurance',
  'Taxes and Licenses',
  'Depreciation',
  'Amortization',
  'Others'
];

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {expenseCategories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}