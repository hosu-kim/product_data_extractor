/*
file: product_data_extractor.ts
description: Calls the API as few times as possible to store the results of API calls with optimized logic.
author: Hosu Kim with ♥️ to Apify
created: 2025-05-19 21:06:21 UTC
*/

const BASE_API_URL: string = 'https://api.ecommerce.com/products';
const INITIAL_MIN_PRICE: number = 0;
const INITIAL_MAX_PRICE: number = 100000;
const MAX_NUM_OF_PRODUCTS_PER_CALL = 1000;
let TOTAL_API_CALLS = 0;

interface Product
{
	[key: string]: any;
}

interface ApiResponseData
{
	total: number;
	count: number;
	products: Product[];
}

async function fetchDataByPriceRange(minPrice: number, maxPrice: number): Promise<ApiResponseData>
{
	const url: string = `${ BASE_API_URL }?minPrice=${ minPrice }&maxPrice=${ maxPrice }`;

	try
	{
		const response = await fetch(url);
		TOTAL_API_CALLS++;

		if (!response.ok)
		{
			throw new Error(`HTTP error. status: ${ response.status }`);
		}

		const data: ApiResponseData = await response.json();
		return data;
	}
	catch (error)
	{
		console.error("Error occured during the API call: ", error);
		throw error;
	}
}

/* ============================== CORE LOGIC FUNCTION ============================== */
async function getProductDataRecursively(
	minPrice: number,
	maxPrice: number,
	initialFetchedData?: ApiResponseData
): Promise<Product[]>
{	
	// Pamameter validation check
	if (minPrice > maxPrice)
	{
		console.log("Wrong price range provided.");
		return []
	}

	const currentRangeData = initialFetchedData ?
							 initialFetchedData : await fetchDataByPriceRange(minPrice, maxPrice);

	if (currentRangeData.count === currentRangeData.total)
	{
		console.log(`In Range ${ minPrice } - ${ maxPrice }, all ${ currentRangeData } fetched.`)
		return currentRangeData.products;
	}
	else if (minPrice === maxPrice)
	{
		console.warn("Price range cannot be split. Returns current product data fetched.");
		return currentRangeData.products;
	}
	else
	{
		const midPrice = Math.floor(minPrice + (maxPrice - minPrice) / 2);

		const [lowerPriceRange, upperPriceRange] = await Promise.all([
			getProductDataRecursively(minPrice, midPrice),
			getProductDataRecursively(midPrice + 1, maxPrice)
		]);
		return [...lowerPriceRange, ...upperPriceRange];
	}
}

async function main()
{
	try
	{
		let productData: Product[] = []; // Stores products data from API calls here.

		// Gets initial data to get the number of all products in the API data.
		const initialProductData: ApiResponseData = await fetchDataByPriceRange(INITIAL_MIN_PRICE, INITIAL_MAX_PRICE);
		const numOfAllProducts = initialProductData.total;

		/* Three conditional branches:
		1. No product data to store
		2. The number of the products are 1000 or less: Store the data with only one API call.
		3. The number of the products are more than 1000: Core logic starts
		*/
		if (numOfAllProducts <= 0)
		{
			console.log("Fetching completed: No product found.");
		}
		else if (numOfAllProducts <= MAX_NUM_OF_PRODUCTS_PER_CALL)
		{
			productData = initialProductData.products;
			console.log(`Fetching completed: ${ numOfAllProducts } are fetched in the API call.`);
		}
		else if (numOfAllProducts > MAX_NUM_OF_PRODUCTS_PER_CALL)
		{
			console.log(`Total number of Products:${ numOfAllProducts }`);
			productData = await getProductDataRecursively(INITIAL_MIN_PRICE, INITIAL_MAX_PRICE, initialProductData);

		}
		console.log(`Total API calls: ${ TOTAL_API_CALLS }, Total products fetched ${ productData.length }`);
	}
	catch (error)
	{
		console.error("Failed to get the total number of products: ", error);
	}
}

main();
