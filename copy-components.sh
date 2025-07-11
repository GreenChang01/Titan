#!/bin/bash

# Array of components to copy
components=(
  "alert-dialog" "alert" "avatar" "badge" "calendar" "checkbox" "collapsible" 
  "command" "dialog" "dropdown-menu" "form" "input-otp" "input" "label" 
  "popover" "radio-group" "scroll-area" "select" "separator" "sheet" 
  "skeleton" "sonner" "switch" "table" "tabs" "textarea" "tooltip"
)

# Copy each component
for component in "${components[@]}"
do
  echo "Copying $component..."
  curl -s "https://raw.githubusercontent.com/satnaing/shadcn-admin/main/src/components/ui/$component.tsx" \
    -o "/home/green/project/titan/apps/nextjs-frontend/src/components/ui/$component.tsx"
done

echo "All components copied!"