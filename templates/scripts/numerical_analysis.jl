#!/usr/bin/env julia
# Numerical analysis script for Flowboard template

using JSON
using DataFrames
using Statistics

function main()
    # Read input parameters
    params = Dict()
    if length(ARGS) > 0
        try
            params = JSON.parse(ARGS[1])
        catch e
            println(stderr, "Invalid JSON parameters: $e")
            return
        end
    end

    # Get input data
    input_data = get(params, "inputData", Dict())
    
    println("Performing numerical analysis...")
    
    # Create sample data
    x = range(0, stop=10, length=100)
    y = sin.(x) + 0.1 * randn(length(x))
    
    # Perform analysis
    mean_y = mean(y)
    std_y = std(y)
    min_y = minimum(y)
    max_y = maximum(y)
    
    # Fit a simple model (linear regression)
    # In Julia, we could use GLM package for more advanced fitting
    # For simplicity, we'll just calculate the trend
    n = length(x)
    slope = (n * sum(x .* y) - sum(x) * sum(y)) / (n * sum(x.^2) - sum(x)^2)
    
    analysis = Dict(
        "mean" => mean_y,
        "std" => std_y,
        "min" => min_y,
        "max" => max_y,
        "slope" => slope,
        "x_data" => x[1:10:end],  # Subsample for output
        "y_data" => y[1:10:end]   # Subsample for output
    )
    
    # Output results
    result = Dict(
        "nodeId" => get(params, "nodeId", "unknown"),
        "data" => analysis,
        "message" => "Numerical analysis completed successfully"
    )
    
    println(JSON.json(result, 2))
end

main()