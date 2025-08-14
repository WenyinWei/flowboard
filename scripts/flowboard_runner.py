#!/usr/bin/env python3
"""
Environment detection and execution script for Flowboard
"""

import sys
import json
import subprocess
import shutil
import os
import numpy as np
import matplotlib.pyplot as plt

def detect_environments():
    """Detect available environments"""
    environments = {}
    
    # Check for Python
    python_path = shutil.which('python')
    if python_path:
        try:
            result = subprocess.run([python_path, '--version'], 
                                  capture_output=True, text=True)
            environments['python'] = {
                'path': python_path,
                'version': result.stdout.strip()
            }
        except:
            pass
    
    # Check for Python3
    python3_path = shutil.which('python3')
    if python3_path:
        try:
            result = subprocess.run([python3_path, '--version'], 
                                  capture_output=True, text=True)
            environments['python3'] = {
                'path': python3_path,
                'version': result.stdout.strip()
            }
        except:
            pass
    
    # Check for Julia
    julia_path = shutil.which('julia')
    if julia_path:
        try:
            result = subprocess.run([julia_path, '--version'], 
                                  capture_output=True, text=True)
            environments['julia'] = {
                'path': julia_path,
                'version': result.stdout.strip()
            }
        except:
            pass
    
    # Check for g++
    gpp_path = shutil.which('g++')
    if gpp_path:
        try:
            result = subprocess.run([gpp_path, '--version'], 
                                  capture_output=True, text=True)
            environments['cpp'] = {
                'path': gpp_path,
                'version': result.stdout.split('\n')[0].strip()
            }
        except:
            pass
    
    return environments

def generate_sample_data():
    """Generate sample numpy array data"""
    np.random.seed(42)
    data = np.random.randn(100)
    return data

def process_data(operation, data):
    """Process data based on operation"""
    if operation == 'mean':
        return np.mean(data)
    elif operation == 'sum':
        return np.sum(data)
    elif operation == 'variance':
        return np.var(data)
    elif operation == 'std':
        return np.std(data)
    elif operation == 'histogram':
        return np.histogram(data, bins=20)
    else:
        return data

def create_visualization(viz_type, data, output_path, params=None):
    """Create visualization based on type"""
    if params is None:
        params = {}
    
    plt.figure(figsize=(10, 6))
    
    if viz_type == 'scatter':
        plt.scatter(range(len(data)), data, alpha=0.7)
        plt.xlabel('Index')
        plt.ylabel('Value')
        plt.title('Scatter Plot')
    elif viz_type == 'line':
        plt.plot(data, linewidth=2)
        plt.xlabel('Index')
        plt.ylabel('Value')
        plt.title('Line Plot')
    elif viz_type == 'histogram':
        counts, bins, patches = plt.hist(data, bins=20, alpha=0.7, color='skyblue', edgecolor='black')
        plt.xlabel('Value')
        plt.ylabel('Frequency')
        plt.title('Histogram')
    elif viz_type == 'fit_line':
        # Create scatter plot with fitted line
        x = np.arange(len(data))
        coeffs = np.polyfit(x, data, 1)
        fitted_line = np.polyval(coeffs, x)
        
        plt.scatter(x, data, alpha=0.7, label='Data')
        plt.plot(x, fitted_line, 'r-', linewidth=2, label=f'Fit: y={coeffs[0]:.2f}x+{coeffs[1]:.2f}')
        plt.xlabel('Index')
        plt.ylabel('Value')
        plt.title('Data with Linear Fit')
        plt.legend()
    
    # Apply custom parameters
    if 'title' in params:
        plt.title(params['title'])
    if 'xlabel' in params:
        plt.xlabel(params['xlabel'])
    if 'ylabel' in params:
        plt.ylabel(params['ylabel'])
    if 'fontsize' in params:
        plt.rcParams.update({'font.size': params['fontsize']})
    
    # Save the plot
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    return {
        'output_path': output_path,
        'plot_params': params
    }

def main():
    # Read input parameters
    params = {}
    if len(sys.argv) > 1:
        try:
            params = json.loads(sys.argv[1])
        except json.JSONDecodeError:
            print("Invalid JSON parameters", file=sys.stderr)
            return

    # Get node ID and operation
    node_id = params.get('nodeId', 'unknown')
    operation = params.get('operation', 'generate_data')
    
    print(f"Executing operation: {operation}")
    
    # Handle different operations
    if operation == 'detect_environments':
        environments = detect_environments()
        result = {
            'nodeId': node_id,
            'environments': environments,
            'message': 'Environment detection completed'
        }
        print(json.dumps(result, indent=2))
        
    elif operation == 'generate_data':
        data = generate_sample_data()
        result = {
            'nodeId': node_id,
            'data': data.tolist(),
            'message': 'Sample data generated'
        }
        print(json.dumps(result, indent=2))
        
    elif operation in ['mean', 'sum', 'variance', 'std']:
        input_data = params.get('inputData', [])
        if input_data:
            data = np.array(input_data)
            result_value = process_data(operation, data)
            result = {
                'nodeId': node_id,
                'operation': operation,
                'result': float(result_value),
                'message': f'{operation.capitalize()} calculation completed'
            }
            print(json.dumps(result, indent=2))
        else:
            print(json.dumps({
                'nodeId': node_id,
                'error': 'No input data provided'
            }), file=sys.stderr)
            
    elif operation == 'visualize':
        input_data = params.get('inputData', [])
        viz_type = params.get('vizType', 'line')
        output_path = params.get('outputPath', f'output_{node_id}.png')
        viz_params = params.get('vizParams', {})
        
        if input_data:
            data = np.array(input_data)
            result = create_visualization(viz_type, data, output_path, viz_params)
            result['nodeId'] = node_id
            result['message'] = f'Visualization created: {viz_type}'
            print(json.dumps(result, indent=2))
        else:
            print(json.dumps({
                'nodeId': node_id,
                'error': 'No input data provided for visualization'
            }), file=sys.stderr)
            
    else:
        result = {
            'nodeId': node_id,
            'message': f'Unknown operation: {operation}'
        }
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()