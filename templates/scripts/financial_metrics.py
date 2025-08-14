#!/usr/bin/env python3
"""
Financial metrics calculation script for Flowboard template
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
    
    print("Calculating financial metrics...")
    
    # Create sample stock data
    dates = pd.date_range('2023-01-01', periods=12, freq='M')
    prices = [100, 105, 110, 108, 115, 120, 118, 125, 130, 128, 135, 140]
    
    df = pd.DataFrame({
        'date': dates,
        'price': prices
    })
    
    # Calculate returns
    df['return'] = df['price'].pct_change()
    
    # Calculate metrics
    metrics = {
        'average_return': float(df['return'].mean()),
        'volatility': float(df['return'].std()),
        'sharpe_ratio': float(df['return'].mean() / df['return'].std()) if df['return'].std() != 0 else 0,
        'max_drawdown': float((df['price'].max() - df['price'].min()) / df['price'].max()),
        'total_return': float((df['price'].iloc[-1] - df['price'].iloc[0]) / df['price'].iloc[0])
    }
    
    # Output results
    result = {
        "nodeId": params.get('nodeId', 'unknown'),
        "data": metrics,
        "message": "Financial metrics calculated successfully"
    }
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()