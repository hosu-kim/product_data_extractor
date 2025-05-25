# Product Data Extractor By Price Range From API

## Project Summary

This project features a TypeScript script (`product_data_extractor.ts`) designed to efficiently extract all product data from an imaginary e-commerce JSON API. The primary challenge is the API's limitation of returning a maximum of 1000 products per request. The script overcomes this by intelligently and recursively dividing ranges to fetch all products while aiming to minimize the total number of API calls.

## Key Features

* **Recursive Data Extraction**: Effectively handles API pagination limits.
* **Dynamic Price Range Division**: Strategically narrows down price segments to ensure complete data retrieval.
* **API Call Minimization**: Reduces redundant calls by reusing fetched data where possible.
* **Clear Logging**: Provides console output for progress and potential issues.

## Problem Statement

1. Extract all products from an imaginary e-commerce API at `https://api.ecommerce.com/products`.
2. The API returns a maximum of 1000 products per call (`MAX_PRODUCTS_PER_CALL`).
3. The total number of products is unknown upfront but is provided in the API response.
4. Products are priced between $0 and $100,000.
5. The only available query parameters to narrow down results are `minPrice` and `maxPrice`.
6. The goal is to scrape all products, accumulate them into a single array, and optimize the solution to use the fewest API requests.

## Solution Approach

The script implements a divide-and-conquer strategy using recursion:

1. **Initial Fetch**: An initial API call is made for the entire price range ($0 - $100,000) to determine the `total` number of products available.
2. **Simple Case**: If the `total` products are less than or equal to `MAX_PRODUCTS_PER_CALL` (1000), they are fetched in this single API call.
3. **Recursive Fetching**: If `total` products exceed `MAX_PRODUCTS_PER_CALL`, the `getProductDataRecursively` function is invoked.
	* It processes a `minPrice` and `maxPrice` range.
	* Base cases for recursion are when all products for the current range are fetched (`count === total`) or the price range cannot be split further (`minPrice === maxPrice`).
	* Otherwise, it divides the price range by a `midPrice`, recursively calls itself for the two sub-ranges, and merges the results.
	* Data from the initial API call is passed to the first recursive call to avoid a duplicate request.

## Key Code Structure

* `fetchDataByPriceRange(minPrice, maxPrice)`: Handles the actual API call for a given price range.
* `getProductDataRecursively(minPrice, maxPrice, initialFetchedData?)`: The core recursive logic for fetching data by dividing price ranges.
* `main()`: The entry point function that orchestrates the overall fetching process.

## Assumptions and Limitations

* **Products at a Single Price Point Exceeding Limit**: If the number of products at a single, indivisible price point (i.e., `minPrice === maxPrice`) exceeds `MAX_PRODUCTS_PER_CALL`, the script can only fetch up to `MAX_PRODUCTS_PER_CALL` items for that specific price. This is a known limitation if the API doesn't offer additional pagination mechanisms (e.g., `offset` or `page` parameters) for a fixed price.

## Author
**hosu-kim**

## License

This project is licensed under the MIT License.
