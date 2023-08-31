#!/bin/bash

# Read each line in the .env file
while read -r line
do
  # Export the key-value pair as an environment variable
  export "$line"
done < ".env"