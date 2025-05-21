# E-commerce Product Data Extractor

## Project Overview

This project features a TypeScript script (`product_data_extractor.ts`) designed to efficiently extract all product data from an imaginary e-commerce JSON API. The primary challenge addressed is the API's limitation of returning a maximum of 1000 products per request. The script overcomes this by intelligently querying specific price ranges recursively, ensuring all products are fetched while aiming to minimize the total number of API calls.

## Problem Statement

1. Extract all products from an e-commerce API located at
`https://api.ecommerce.com/products` (note: this is an imaginary URL).
2. The API returns a maximum of 1000 products per call (`MAX_PRODUCTS_PER_CALL`).
3. The total number of products is unknown upfront but is provided in the API response for any given query.
4. Products are priced between $0 and $100,000.
5. The only available query parameters to narrow down results are `minPrice` and `maxPrice`.
6. The goal was to create an algorithm to scrape all products, accumulate them into a single array, and optimize the solution to use the least amount of API requests.

## Solution Approach

The script implements a divide-and-conquer strategy using recursion:

1. **Initial Fetch**: An initial API call is made for the entire price range ($0 - $100,000) to determine the `total` number of products available.
2. **Simple Case**: If the `total` products are less than or equal to `MAX_PRODUCTS_PER_CALL` (1000), they are fetched in this single API call. The data from this initial call is used directly.
3. **Recursive Fetching**: If `total` products exceed `MAX_PRODUCTS_PER_CALL`, the `getProductDataRecursively` function is invoked.
	* This function takes a `minPrice` and `maxPrice` range.
	* It first checks if the data for the current range (passed as `initialFetchedData` for the first recursive call, or fetched anew for subsequent calls) contains all products within that specific range (`count === total`). If so, these products are returned.
	* **Base Cases For Recursion**:
		* If all products for the current range are fetched (`count === total`).
		* If the price range cannot be split further (`minPrice === maxPrice`).
In this scenario, it returns whatever products were fetched. This handles a known limitation where items at a single price point might still exceed `MAX_PRODUCTS_PER_CALL`.
	* **Recursive Step**: If more products exist in the current range than were returned (`count < total`) and the range can be split, the function:
		1. Calculates a `midPrice`.
		2. Makes two parallel recursive calls: one for the lower half (`minPrice` to `midPrice`) and one for the upper half (`midPrice + 1` to `maxPrice`).
		3. The results from these two sub-ranges are then concatenated and returned.
		4. **Aggregation**: All fetched products are accumulated into a single array.
		5. **Optimization**: The data from the very first API call is passed to the initial recursive call to avoid an identical duplicate request for the full price range. The `total_api_calls` variable tracks the number of requests made.

## Code Structure
* `BASE_API_URL`: Base URL for the imaginary API.
* `INITIAL_MIN_PRICE`, `INITIAL_MAX_PRICE`: Defines the overall price range.
* `MAX_PRODUCTS_PER_CALL`: Maximum products the API returns per call.
* `totalApiCalls`: Counter for API requests.
* `Product` interface: Defines the structure for product data (flexible `[key: string]: any`).
* `ApiResponseData` interface: Defines the structure of the API response.
* `fetchDataByPriceRange(minPrice, maxPrice)`: Handles the actual API call for a given price range.
* `getProductDataRecursively(minPrice, maxPrice, initialFetchedData?)`: The core recursive logic for fetching data by dividing price ranges.
* `main()`: The entry point function that orchestrates the overall fetching process.

## Key Features
* **Recursive Data Extraction**: Effectively handles API pagination limits.
* **Dynamic Price Range Division**: Strategically narrows down price segments to ensure complete data retrieval.
* **API Call Minimization**: Designed to reduce redundant calls by reusing fetched data where possible.
* **Clear Logging**: Provides console output for progress and potential issues (e.g., when a price range cannot be split further but still has more items than fetched).

## Assumptions and Limitations

The script operates under the following assumptions based on the assignment:

1. **API Behavior**: The API at `https://api.ecommerce.com/products` works as described, supporting `minPrice` and `maxPrice` GET parameters.
2. **Price Range**: All product prices fall strictly between `$0` and `$100,000`.
3. **Response Consistency**: The API response structure (`total`, `count`, `products`) is consistent.
4. **Integer Prices**: The price splitting logic (`Math.floor(minPrice + (maxPrice - minPrice / 2)` and `midprice + 1`)) assumes that prices can be effectively managed as integers or that the API handles these range boundaries inclusively/exclusively in a way that doesn't miss products.
5. **Product Distribution**: The core limitation, acknowledged in the code, is when the number of products at a single, indivisible price point (i.e., `minPrice === maxPrice`) exceeds `MAX_PRODUCTS_PER_CALL`. In such a case, the scripts will fetch up to `MAX_PRODUCTS_PER_CALL` items for that specific price but cannot fetch the remainder, as the API (as defined) provides no further mechanism (like an `offset` or `page` parameter for a fixed price) to get the next batch. The script logs a warning in this scenario.

**Addressing Limitations**:
To fully overcome the single price point limitation, the imaginary API would need to support an additional pagination mechanism (e.g., `offset` or `page` parameter) that works even when `minPrice` and `maxPrice` are identical and `count < total`. Without such an API feature, the current solution is as comprehensive as possible given the specified constraints.

## Conclusion

This script provides a robust solution to the problem of fetching a large dataset from a rate-limited API by recursively breaking down the query space. It prioritizes fetching all data while being mindful of the number of API requests.

## Author
* **hosu-kim**

## License
This project is licensed uner the MIT License. See the [LICENSE.md](LICENSE.md)