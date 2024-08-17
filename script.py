import re
import sys
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time
import os

api_data = {}

def load_existing_json(output_path):
    global api_data
    if os.path.exists(output_path):
        with open(output_path, 'r') as json_file:
            try:
                api_data = json.load(json_file)
                print(f"Loaded existing API data from {output_path}")
            except json.JSONDecodeError:
                print(f"Failed to decode JSON from {output_path}. Starting with an empty dictionary.")
                api_data = {}
    else:
        print(f"No existing JSON file found at {output_path}. Starting with an empty dictionary.")
        api_data = {}

def extract_api_info(log_file):
    global api_data
    log_pattern = re.compile(r'\"(GET|POST|PUT|DELETE|PATCH) (.+?) HTTP/[\d\.]+\" (\d{3})')

    with open(log_file, 'r') as file:
        for line in file:
            match = log_pattern.search(line)
            if match:
                method, endpoint, response_code = match.groups()
                if endpoint not in api_data:
                    api_data[endpoint] = {}

                if method not in api_data[endpoint]:
                    api_data[endpoint][method] = {
                        "access_count": 0,
                        "response_codes": {}
                    }
                api_data[endpoint][method]["access_count"] += 1
                if response_code not in api_data[endpoint][method]["response_codes"]:
                    api_data[endpoint][method]["response_codes"][response_code] = 0
                api_data[endpoint][method]["response_codes"][response_code] += 1

def save_api_data_to_file(output_path):
    global api_data
    directory = os.path.dirname(output_path)
    if not os.path.exists(directory):
        os.makedirs(directory)
    with open(output_path, 'w') as json_file:
        json.dump(api_data, json_file, indent=4)
    print(f"API data saved to {output_path}")

def process_log_file(log_file, output_path):
    extract_api_info(log_file)
    save_api_data_to_file(output_path)

class LogFileHandler(FileSystemEventHandler):
    def __init__(self, log_file, output_path):
        self.log_file = log_file
        self.output_path = output_path

    def on_modified(self, event):
        if event.src_path.endswith('api-logs.log'):
            print(f"{event.src_path} has been modified")
            process_log_file(self.log_file, self.output_path)

def main():
    log_file = '/mnt/c/Users/prati/infosec/backend/src/logs/api-logs.log'
    output_path = '/mnt/c/Users/prati/infosec/backend/src/public/api_data.json'
    
    load_existing_json(output_path)

    if os.path.exists(log_file):
        process_log_file(log_file, output_path)
    else:
        print(f"Log file {log_file} does not exist.")
        sys.exit(1)

    event_handler = LogFileHandler(log_file, output_path)
    observer = Observer()
    observer.schedule(event_handler, path=os.path.dirname(log_file), recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()

if __name__ == "__main__":
    main()
