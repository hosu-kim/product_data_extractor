/*
file: product_data_extractor.ts
description: Calls the API as few times as possible 
			 to fetch all the product data results with optimized logic.
author: hosu-kim
created: 2025-05-19 21:06:21 UTC
*/

/*
My coding principles:
1. Self-documenting code === Team play lover 🤝
2. Comments are my life - Who cooked this spaghetti? 🍝 author: hosu-kim
3. let typing: bug traps; 🪲
*/

const BASE_API_URL: string = 'https://api.ecommerce.com/products';
const INITIAL_MIN_PRICE: number = 0;
const INITIAL_MAX_PRICE: number = 100000;
const MAX_PRODUCTS_PER_CALL: number = 1000;
let totalApiCalls: number = 0;

// The structure of the array for product data
interface Product
{
	[key: string]: any;
}

// The structure of the object from the API response
interface ApiResponseData
{
	total: number;
	count: number;
	products: Product[];
}

/**
 * Fetches the API response with the query parameters, minPrice and maxPrice.
 * 
 * @param minPrice - The minimum price of products to fetch from.
 * @param maxPrice - The maximum price of products to fetch to.
 * @returns {Promise<ApiResponseData>} API response data
 * @throw Error if HTTP response error
 */
async function fetchResponseByPriceRange(minPrice: number, maxPrice: number): Promise<ApiResponseData>
{
	const url: string = `${ BASE_API_URL }?minPrice=${ minPrice }&maxPrice=${ maxPrice }`;

	try
	{
		const response: Response = await fetch(url);
		totalApiCalls++;

		// status code: 200-299(true), 4xx or 5xx(false)
		if (!response.ok)
			throw new Error(`HTTP error status - ${ response.status }`);

		const responseData: ApiResponseData = await response.json();
		return responseData;
	}
	catch (error)
	{
		console.error(`Error occured during the API call: ${ error }`);
		throw error;
	}
}

/* ============================== CORE LOGIC FUNCTION ============================== */
/**
 * Recursively fetches product data. This function is called when a signle API request 
 * for a given pricd range does not return all products within that range.
 * and the range can be further sub-divided.
 * 
 * The logic is to divided the current price range by its midpoint and make two recursive 
 * calls for the lower and upper sub-ranges.
 * 
 * Base cases for Recursion:
 * 1. All products for the current range are fetched in one API call (count === total).
 * 2. The price range cannot be split further (minPrice === maxPrice). In this case,
 * 	  it returns whatever products were fetched for that sigle price point. This handles
 * 	  the known limitation where items at a single price might exceed MAX_PRODUCTS_PER_CALL.
 * 
 * @param minPrice - The minimum price of products to fetch from.
 * @param maxPrice - The maximum price of products to fetch to.
 * @param initialFetchedData - optional: Use initial fetched data once at the beginning
 * 										 to avoid duplicate API calls with the same parameters
 * @returns {Promise<Product[]>} Products data in an array: [{}, {}, {}, ...]
 */
async function extractProductDataRecursively(
	minPrice: number,
	maxPrice: number,
	initialFetchedData?: ApiResponseData
): Promise<Product[]>
{	
	// Parameter validation check
	if (minPrice > maxPrice)
	{
		console.error("Error: minPrice cannot be greater than maxPrice.");
		return [];
	}

	const currentRangeData: ApiResponseData =
	initialFetchedData ? initialFetchedData : await fetchResponseByPriceRange(minPrice, maxPrice);

	if (currentRangeData.count === currentRangeData.total)
	{
		console.log(`In The range (${ minPrice } - ${ maxPrice }), all ${ currentRangeData.count } fetched.`);
		return currentRangeData.products;
	}
	else if (minPrice === maxPrice)
	{
		console.warn(`Price range cannot be split. Only returns fetched ${ currentRangeData.count } products data.`);
		return currentRangeData.products;
	}
	else
	{
		// (minPrice + maxPrice) / 2 for midPrice: X
		// This form is safer against overflow especially with larger integers.
		const midPrice: number = Math.floor(minPrice + (maxPrice - minPrice) / 2);

		const [lowerPriceRange, upperPriceRange]: [Product[], Product[]] = await Promise.all([
			extractProductDataRecursively(minPrice, midPrice),
			extractProductDataRecursively(midPrice + 1, maxPrice)
		]);
		return [...lowerPriceRange, ...upperPriceRange];
	} 
}

async function main()
{
	try
	{
		let products: Product[] = []; // Here stores products data from API responses.

		// Fetches initial data to get the number of all products in the API data.
		const initialResponseData: ApiResponseData = await fetchResponseByPriceRange(INITIAL_MIN_PRICE, INITIAL_MAX_PRICE);
		const numOfTotalProducts: number = initialResponseData.total;

		/* Here three conditional branches:
		1. No product data to store
		2. The number of the products are 1000 or less: Store the data with only one API call.
		3. The number of the products are more than 1000: Core recursion logic starts
		*/
		if (numOfTotalProducts === 0)
			console.log("Fetching completed: No product found.");
		else if (numOfTotalProducts <= MAX_PRODUCTS_PER_CALL)
		{
			products = initialResponseData.products;
			console.log(`Fetching completed. Fetched ${ initialResponseData.count } products.`);
		}
		else if (numOfTotalProducts > MAX_PRODUCTS_PER_CALL)
			products = await extractProductDataRecursively(INITIAL_MIN_PRICE, INITIAL_MAX_PRICE, initialResponseData);
		console.log(`Summary - Total API calls: ${ totalApiCalls }, Total extracted products: ${ products.length }`);
	}
	catch (error)
	{
		console.error(`Error occured: ${ error }`);
	}
}

main();
