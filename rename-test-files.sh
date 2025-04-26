#!/bin/bash

# Navigate to the test directory
cd /home/thangtt/Documents/GitHub/hirebot-ai-api/test

# Loop through all JavaScript files in the directory
for file in *.js; do
    # Skip if not a file
    [ -f "$file" ] || continue
    
    # Remove the "Test.js" suffix
    base_name=${file%Test.js}
    
    # Convert camelCase to kebab-case
    # This adds a hyphen before each uppercase letter and converts to lowercase
    kebab_name=$(echo "$base_name" | sed -r 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]')
    
    # Add the ".test.js" suffix
    new_name="${kebab_name}.test.js"
    
    # Rename the file
    echo "Renaming $file to $new_name"
    mv "$file" "$new_name"
done

echo "All files have been renamed to kebab-case format."