/*
file: product_data_extractor.ts
description: 
author: Hosu Kim with ♥️ to Apify
created: 05/19/25 21:06:21 UTC
*/

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

url: string = "https://api.ecommerce.com/products";

async function fetchData(url: string): Promise<ApiResponseData>
{
	try
	{
		const response = await fetch(url);

		if (!response.ok)
		{
			throw new Error(`HTTP error. status: ${response.status}`);
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

function main
{

}

main();