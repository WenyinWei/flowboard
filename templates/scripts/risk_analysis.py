#!/usr/bin/env python3
"""
Risk analysis script for Flowboard template
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
    
    print("Performing risk analysis...")
    
    # Create sample portfolio data
    assets = ['Stock A', 'Stock B', 'Stock C', 'Bond D']
    weights = [0.4, 0.3, 0.2, 0.1]
    expected_returns = [0.12, 0.10, 0.15, 0.05]
    volatilities = [0.20, 0.15, 0.25, 0.10]
    
    # Calculate portfolio metrics
    portfolio_return = sum(w * r for w, r in zip(weights, expected_returns))
    
    # Simplified portfolio risk calculation
    portfolio_risk = sum(w * v for w, v in zip(weights, volatilities))
    
    # Risk breakdown
    risk_breakdown = {}
    for i, asset in enumerate(assets):
        risk_breakdown[asset] = {
            'weight': weights[i],
            'contribution': weights[i] * volatilities[i] / portfolio_risk if portfolio_risk != 0 else 0
        }
    
    analysis = {
        'portfolio_return': portfolio_return,
        'portfolio_risk': portfolio_risk,
        'sharpe_ratio': portfolio_return / portfolio_risk if portfolio_risk != 0 else 0,
        'risk_breakdown': risk_breakdown
    }
    
    # Output results
    result = {
        "nodeId": params.get('nodeId', 'unknown'),
        "data": analysis,
        "message": "Risk analysis completed successfully"
    }
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()