#!/usr/bin/env python3
"""
Statistical analysis script for Flowboard template
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
    
    print("Performing statistical analysis...")
    
    # Convert input data to DataFrame
    if isinstance(input_data, list):
        df = pd.DataFrame(input_data)
    else:
        # Create sample data if no input
        data = {
            'name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
            'age': [25, 30, 35, 40, 45],
            'salary': [50000, 60000, 70000, 80000, 90000],
            'department': ['Engineering', 'Marketing', 'Sales', 'Engineering', 'HR']
        }
        df = pd.DataFrame(data)
    
    # Perform statistical analysis
    stats = {
        'mean_salary': float(df['salary'].mean()),
        'median_salary': float(df['salary'].median()),
        'std_salary': float(df['salary'].std()),
        'min_salary': float(df['salary'].min()),
        'max_salary': float(df['salary'].max()),
        'count': len(df)
    }
    
    # Output results
    result = {
        "nodeId": params.get('nodeId', 'unknown'),
        "data": stats,
        "message": "Statistical analysis completed successfully"
    }
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()