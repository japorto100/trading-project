export interface NewsSource {
	id: string;
	name: string;
	url: string;
	category: "finance" | "mainstream" | "community" | "reference";
}

export const NEWS_SOURCES: NewsSource[] = [
	{ id: "finviz", name: "Finviz", url: "https://finviz.com/news.ashx", category: "finance" },
	{
		id: "yahoo-finance",
		name: "Yahoo Finance",
		url: "https://finance.yahoo.com/news/",
		category: "finance",
	},
	{
		id: "marketwatch",
		name: "MarketWatch",
		url: "https://www.marketwatch.com/latest-news",
		category: "finance",
	},
	{
		id: "barrons",
		name: "Barron's",
		url: "https://www.barrons.com/latest-news",
		category: "finance",
	},
	{
		id: "wsj",
		name: "WSJ Markets",
		url: "https://www.wsj.com/news/markets",
		category: "mainstream",
	},
	{
		id: "bloomberg",
		name: "Bloomberg Markets",
		url: "https://www.bloomberg.com/markets",
		category: "mainstream",
	},
	{
		id: "reddit-stockmarket",
		name: "Reddit r/StockMarket",
		url: "https://www.reddit.com/r/StockMarket/new/",
		category: "community",
	},
	{
		id: "reddit-investing",
		name: "Reddit r/investing",
		url: "https://www.reddit.com/r/investing/new/",
		category: "community",
	},
	{
		id: "insightsentry",
		name: "Insightsentry",
		url: "https://insightsentry.com",
		category: "reference",
	},
	{
		id: "lse-retail-fee-waiver",
		name: "LSE Retail Data Waiver",
		url: "https://www.londonstockexchange.com/equities-trading/market-data/retail-investor-market-data-end-user-fee-waiver",
		category: "reference",
	},
	{
		id: "finage-docs",
		name: "Finage Stocks",
		url: "https://finage.co.uk/product/stocks",
		category: "reference",
	},
	{
		id: "coinmarketcap-docs",
		name: "CoinMarketCap API Docs",
		url: "https://coinmarketcap.com/api/documentation/v1/",
		category: "reference",
	},
];

export default NEWS_SOURCES;
