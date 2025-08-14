#!/usr/bin/env python3
"""
Data cleaning script for Flowboard template
"""

import sys
import json
import pandas as pd
import numpy as np

def main():
    # Read input parameters
    params = {}
    if len(sys.argv) > 1:
        try:
            params = json.loads(sys.argv[1])
        except json.JSONDecodeError:
            print("Invalid JSON parameters", file=sys.stderr)
            return

    # Get input data
    input_data = params.get('inputData', {})
    
    # For this template, we'll simulate reading a CSV file
    # In a real implementation, this would read from the actual data source
    print("Reading and cleaning data...")
    
    # Create sample data
    data = {
        'name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
        'age': [25, 30, 35, 40, 45],
        'salary': [50000, 60000, 70000, 80000, 90000],
        'department': ['Engineering', 'Marketing', 'Sales', 'Engineering', 'HR']
    }
    
    df = pd.DataFrame(data)
    
    # Clean data
    df = df.dropna()  # Remove rows with missing values
    df = df.drop_duplicates()  # Remove duplicate rows
    
    # Convert to dictionary for output
    cleaned_data = df.to_dict('records')
    
    # Output results
    result = {
        "nodeId": params.get('nodeId', 'unknown'),
        "data": cleaned_data,
        "message": "Data cleaning completed successfully"
    }
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()