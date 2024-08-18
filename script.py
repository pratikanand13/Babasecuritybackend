import re
import sys
import json
import os
from collections import defaultdict

def extract_endpoint_data(log_file):
    endpoint_data = defaultdict(lambda: defaultdict(lambda: {
        "access_count": 0,
        "response_codes": defaultdict(int)
    }))

    # Regular expression to match the HTTP method, endpoint, and response code
    log_pattern = re.compile(r'\"(GET|POST|PUT|DELETE|PATCH) (.+?) HTTP.*?\" (\d{3})')

    with open(log_file, 'r') as file:
        for line in file:
            match = log_pattern.search(line)
            if match:
                method = match.group(1)
                endpoint = match.group(2)
                response_code = match.group(3)
                
                # Update access count and response code count for the endpoint
                endpoint_data[endpoint][method]["access_count"] += 1
                endpoint_data[endpoint][method]["response_codes"][response_code] += 1

    return endpoint_data

def main():
    log_file = "src/logs/api-logs.log"
    output_file = "src/public/api.json"

    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    endpoint_data = extract_endpoint_data(log_file)

    # Store the endpoint data in a JSON file
    with open(output_file, 'w') as json_file:
        json.dump(endpoint_data, json_file, indent=4)

    print(f"Endpoint data has been saved to {output_file}")

if __name__ == "__main__":
    main()
