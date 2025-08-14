#!/usr/bin/env python3
"""
Mathematical operations script for Flowboard
"""

import sys
import json
import numpy as np
import pandas as pd

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
    operation = params.get('operation', 'sum')
    dimensions = params.get('dimensions', [])
    
    print(f"Performing {operation} operation...")
    
    # Convert input data to appropriate format
    if isinstance(input_data, list):
        # If it's a list, convert to numpy array
        data = np.array(input_data)
    elif isinstance(input_data, dict):
        # If it's a dict, try to convert to DataFrame
        try:
            data = pd.DataFrame(input_data)
        except:
            # If conversion fails, create a simple DataFrame
            data = pd.DataFrame([input_data])
    else:
        # Create sample data if no input
        data = np.random.rand(10, 5)
    
    # Perform the requested operation
    result = None
    if operation == 'sum':
        if dimensions:
            # Sum along specified dimensions
            axis = tuple(dimensions) if isinstance(dimensions, list) else dimensions
            result = np.sum(data, axis=axis).tolist()
        else:
            # Sum all elements
            result = np.sum(data).tolist()
    elif operation == 'fourier':
        # Fourier transform
        if isinstance(data, np.ndarray):
            result = np.fft.fft(data, axis=-1).tolist()
        else:
            # For DataFrame, apply to each column
            result = data.apply(lambda x: np.fft.fft(x).tolist()).to_dict()
    elif operation == 'matrix_multiply':
        # Matrix multiplication (requires 2D arrays)
        if isinstance(data, np.ndarray) and data.ndim == 2:
            result = np.dot(data, data.T).tolist()
        else:
            result = "Matrix multiplication requires 2D array"
    elif operation == 'statistical_analysis':
        # Statistical analysis
        if isinstance(data, np.ndarray):
            stats = {
                'mean': np.mean(data, axis=0).tolist(),
                'std': np.std(data, axis=0).tolist(),
                'min': np.min(data, axis=0).tolist(),
                'max': np.max(data, axis=0).tolist()
            }
            result = stats
        else:
            # For DataFrame
            stats = {
                'mean': data.mean().to_dict(),
                'std': data.std().to_dict(),
                'min': data.min().to_dict(),
                'max': data.max().to_dict()
            }
            result = stats
    else:
        result = f"Unknown operation: {operation}"
    
    # Output results
    output = {
        "nodeId": params.get('nodeId', 'unknown'),
        "operation": operation,
        "data": result,
        "message": f"{operation} operation completed successfully"
    }
    
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()