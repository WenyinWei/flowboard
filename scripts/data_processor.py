#!/usr/bin/env python3
"""
Data processing script for Flowboard
"""

import sys
import json
import numpy as np
import matplotlib.pyplot as plt
import os

def generate_sample_data(size=100, seed=42):
    """Generate sample numpy array data"""
    np.random.seed(seed)
    # Generate some interesting data - sine wave with noise
    x = np.linspace(0, 4*np.pi, size)
    y = np.sin(x) + 0.1 * np.random.randn(size)
    return y.tolist()

def process_statistical_operation(data, operation):
    """Process statistical operations on data"""
    arr = np.array(data)
    
    if operation == 'mean':
        return float(np.mean(arr))
    elif operation == 'sum':
        return float(np.sum(arr))
    elif operation == 'variance':
        return float(np.var(arr))
    elif operation == 'std':
        return float(np.std(arr))
    elif operation == 'min':
        return float(np.min(arr))
    elif operation == 'max':
        return float(np.max(arr))
    elif operation == 'median':
        return float(np.median(arr))
    else:
        raise ValueError(f"Unknown operation: {operation}")

def create_visualization(data, viz_type, output_path, params=None):
    """Create visualization based on type"""
    if params is None:
        params = {}
    
    # Set figure size
    fig_width = params.get('fig_width', 10)
    fig_height = params.get('fig_height', 6)
    plt.figure(figsize=(fig_width, fig_height))
    
    # Convert data to numpy array
    arr = np.array(data)
    
    if viz_type == 'scatter':
        x = np.arange(len(arr))
        plt.scatter(x, arr, alpha=params.get('alpha', 0.7), 
                   s=params.get('size', 20), c=params.get('color', 'blue'))
        plt.xlabel(params.get('xlabel', 'Index'))
        plt.ylabel(params.get('ylabel', 'Value'))
        plt.title(params.get('title', 'Scatter Plot'))
        
    elif viz_type == 'line':
        x = np.arange(len(arr))
        plt.plot(x, arr, linewidth=params.get('linewidth', 2), 
                color=params.get('color', 'blue'))
        plt.xlabel(params.get('xlabel', 'Index'))
        plt.ylabel(params.get('ylabel', 'Value'))
        plt.title(params.get('title', 'Line Plot'))
        
    elif viz_type == 'histogram':
        bins = params.get('bins', 20)
        plt.hist(arr, bins=bins, alpha=params.get('alpha', 0.7), 
                color=params.get('color', 'skyblue'), edgecolor=params.get('edgecolor', 'black'))
        plt.xlabel(params.get('xlabel', 'Value'))
        plt.ylabel(params.get('ylabel', 'Frequency'))
        plt.title(params.get('title', 'Histogram'))
        
    elif viz_type == 'fit_line':
        # Create scatter plot with fitted line
        x = np.arange(len(arr))
        coeffs = np.polyfit(x, arr, 1)
        fitted_line = np.polyval(coeffs, x)
        
        plt.scatter(x, arr, alpha=params.get('alpha', 0.7), 
                   label=params.get('scatter_label', 'Data'))
        plt.plot(x, fitted_line, 'r-', linewidth=params.get('linewidth', 2), 
                label=f'Fit: y={coeffs[0]:.2f}x+{coeffs[1]:.2f}')
        plt.xlabel(params.get('xlabel', 'Index'))
        plt.ylabel(params.get('ylabel', 'Value'))
        plt.title(params.get('title', 'Data with Linear Fit'))
        plt.legend()
        
    # Apply global styling
    font_size = params.get('font_size', 12)
    plt.rcParams.update({'font.size': font_size})
    
    # Save the plot
    plt.tight_layout()
    plt.savefig(output_path, dpi=params.get('dpi', 300), bbox_inches='tight')
    plt.close()
    
    return {
        'output_path': output_path,
        'slope': coeffs[0] if viz_type == 'fit_line' else None,
        'intercept': coeffs[1] if viz_type == 'fit_line' else None
    }

def main():
    # Read input parameters
    params = {}
    if len(sys.argv) > 1:
        try:
            params = json.loads(sys.argv[1])
        except json.JSONDecodeError:
            print(json.dumps({"error": "Invalid JSON parameters"}), file=sys.stderr)
            return

    # Get node ID and operation
    node_id = params.get('nodeId', 'unknown')
    operation = params.get('operation', 'generate_data')
    
    # Handle different operations
    try:
        if operation == 'generate_data':
            size = params.get('size', 100)
            seed = params.get('seed', 42)
            data = generate_sample_data(size, seed)
            result = {
                'nodeId': node_id,
                'data': data,
                'message': f'Sample data generated (size: {size})'
            }
            
        elif operation in ['mean', 'sum', 'variance', 'std', 'min', 'max', 'median']:
            input_data = params.get('inputData', [])
            if input_data:
                result_value = process_statistical_operation(input_data, operation)
                result = {
                    'nodeId': node_id,
                    'operation': operation,
                    'result': result_value,
                    'message': f'{operation.capitalize()} calculation completed'
                }
            else:
                result = {
                    'nodeId': node_id,
                    'error': 'No input data provided'
                }
                
        elif operation == 'visualize':
            input_data = params.get('inputData', [])
            viz_type = params.get('vizType', 'line')
            output_dir = params.get('outputDir', './outputs')
            filename_pattern = params.get('filenamePattern', f'viz_{node_id}')
            counter = params.get('counter', 1)
            viz_params = params.get('vizParams', {})
            
            if input_data:
                # Create output directory if it doesn't exist
                os.makedirs(output_dir, exist_ok=True)
                
                # Generate output filename
                output_filename = f"{filename_pattern}_{counter:03d}.png"
                output_path = os.path.join(output_dir, output_filename)
                
                # Create visualization
                viz_result = create_visualization(input_data, viz_type, output_path, viz_params)
                result = {
                    'nodeId': node_id,
                    'operation': 'visualize',
                    'vizType': viz_type,
                    'result': viz_result,
                    'message': f'Visualization created: {viz_type}',
                    'nextCounter': counter + 1
                }
            else:
                result = {
                    'nodeId': node_id,
                    'error': 'No input data provided for visualization'
                }
                
        else:
            result = {
                'nodeId': node_id,
                'error': f'Unknown operation: {operation}'
            }
            
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            'nodeId': node_id,
            'error': str(e),
            'operation': operation
        }
        print(json.dumps(error_result, indent=2), file=sys.stderr)

if __name__ == "__main__":
    main()