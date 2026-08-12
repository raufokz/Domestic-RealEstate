import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PropertyGrid from "@/components/properties/PropertyGrid";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, faqLd, SITE_URL } from "@/lib/seo";

export interface CityData {
  name: string;
  state: string;
  country: string;
  population: string;
  medianIncome: string;
  medianHomePrice: string;
  description: string;
  neighborhoods: string[];
  schools: { name: string; rating: string; type: string }[];
  faqs: { q: string; a: string }[];
  avgPricePerSqFt?: string;
  propertyTaxRate?: string;
  appreciationRate?: string;
  marketType?: string;
  walkScore?: string;
  bestFor?: string;
  topEmployers?: string[];
  investmentInsights?: string;
  propertyTypes?: { type: string; avgPrice: string; description: string }[];
  buyingGuide?: { step: string; title: string; text: string }[];
  livingInCity?: { lifestyle: string; transit: string; climate: string };
}

export const CITY_DB: Record<string, CityData> = {
  "new-york-city": {
    name: "New York City",
    state: "New York",
    country: "USA",
    population: "8,336,817",
    medianIncome: "$70,663",
    medianHomePrice: "$1,850,000",
    description:
      "Explore premier New York City real estate, exclusive NYC real estate listings, luxury condos, and spacious houses in NYC across Manhattan, Brooklyn, Queens, and beyond. Whether you are searching for property in NYC, real estate in New York City, or deciding where to buy real estate in NYC, our AI matching platform connects you to top-rated new york city homes and real estate new york city offers.",
    neighborhoods: ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island", "Williamsburg", "SoHo", "Tribeca", "Upper East Side", "Harlem"],
    schools: [
      { name: "Stuyvesant High School", rating: "10/10", type: "Public" },
      { name: "Trinity School", rating: "10/10", type: "Private" },
      { name: "New York University", rating: "9/10", type: "University" },
    ],
    faqs: [
      { q: "Where to buy real estate in NYC for maximum value?", a: "When determining where to buy real estate in NYC, top recommendations include Williamsburg in Brooklyn, Long Island City in Queens, and the Upper West Side in Manhattan. These areas offer prime new york city homes with excellent appreciation and transit access." },
      { q: "How can I search verified New York City real estate listings?", a: "You can browse verified new york city real estate listings on Domestic Real Estate. Filter by price, bedrooms, property type, and neighborhood to find luxury condos, townhouses, and houses in NYC." },
      { q: "What is the average price for property in NYC?", a: "The median home price for real estate in New York City is approximately $1,850,000. Prices vary significantly across new york city properties, with Manhattan leading in price per square foot, followed by Brooklyn and Queens." },
      { q: "Why invest in NYC real estate and new york city properties?", a: "Investing in nyc real estate and real estate new york city provides historical stability, high rental yields, and strong capital preservation due to high global demand and limited land supply." },
    ],
  },
  "los-angeles": {
    name: "Los Angeles",
    state: "California",
    country: "USA",
    population: "3,979,576",
    medianIncome: "$67,418",
    medianHomePrice: "$1,250,000",
    description:
      "Los Angeles is the cultural and entertainment capital of the world. With its diverse neighborhoods, year-round sunshine, and thriving economy, LA offers a wide range of real estate opportunities from beachfront properties to urban lofts.",
    neighborhoods: ["Beverly Hills", "Hollywood", "Santa Monica", "Venice", "Malibu", "Silver Lake", "Echo Park", "Pasadena", "Burbank", "Glendale"],
    schools: [
      { name: "Harvard-Westlake School", rating: "10/10", type: "Private" },
      { name: "University of California, Los Angeles", rating: "10/10", type: "University" },
    ],
    faqs: [
      { q: "What is the average home price in LA?", a: "The median home price in Los Angeles is approximately $1,250,000. Coastal areas like Malibu and Santa Monica command premium prices, while inland neighborhoods offer more affordable options." },
      { q: "What is the best area to buy in LA?", a: "The best area depends on your priorities. Silver Lake and Echo Park are popular with young professionals, Beverly Hills with luxury buyers, and Pasadena with families seeking a suburban feel with city access." },
    ],
  },
  chicago: {
    name: "Chicago",
    state: "Illinois",
    country: "USA",
    population: "2,665,039",
    medianIncome: "$71,673",
    medianHomePrice: "$345,000",
    description: "Chicago real estate spans lakefront high-rises, classic two-flats, and tree-lined suburban-feel neighborhoods, all within one of the most walkable big cities in the US. Buyers searching for Chicago homes for sale benefit from relatively affordable pricing compared to the coasts, strong rental demand near the Loop, and a deep inventory of vintage greystones and modern condos alike.",
    neighborhoods: ["Lincoln Park", "Wicker Park", "Lakeview", "Logan Square", "The Loop", "Hyde Park"],
    schools: [
      { name: "Walter Payton College Prep", rating: "10/10", type: "Public" },
      { name: "University of Chicago", rating: "9/10", type: "University" },
    ],
    faqs: [
      { q: "Is Chicago real estate a good investment?", a: "Chicago offers some of the best price-to-rent ratios among major US metros, with strong cash flow potential in neighborhoods like Logan Square and Pilsen, though buyers should factor in Illinois' relatively high property tax rates." },
      { q: "What is the average price of Chicago homes for sale?", a: "The median home price in Chicago is approximately $345,000, with significant variation between lakefront condos in Lincoln Park and more affordable homes on the South and West Sides." },
    ],
  },
  houston: {
    name: "Houston",
    state: "Texas",
    country: "USA",
    population: "2,302,878",
    medianIncome: "$61,708",
    medianHomePrice: "$330,000",
    description: "Houston real estate stands out for its lack of formal zoning, sprawling new-construction master-planned communities, and a diversified energy, medical, and aerospace economy. With no state income tax and relatively low housing costs for a top-10 US metro, Houston homes for sale attract both first-time buyers and out-of-state relocators.",
    neighborhoods: ["The Heights", "River Oaks", "Montrose", "Midtown", "Sugar Land", "Katy"],
    schools: [
      { name: "Rice University", rating: "10/10", type: "University" },
      { name: "Carnegie Vanguard High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Houston real estate so affordable?", a: "Houston's lack of zoning laws allows faster, cheaper new construction, and Texas has no state income tax, keeping overall cost of living competitive relative to housing supply." },
      { q: "What are the best Houston neighborhoods for families?", a: "The Heights, Sugar Land, and Katy are popular with families for their school districts, newer housing stock, and suburban amenities within commuting distance of downtown." },
    ],
  },
  phoenix: {
    name: "Phoenix",
    state: "Arizona",
    country: "USA",
    population: "1,608,139",
    medianIncome: "$66,382",
    medianHomePrice: "$435,000",
    description: "Phoenix real estate has been one of the fastest-growing markets in the Southwest, driven by retirees, remote workers, and corporate relocations to the Valley of the Sun. Buyers exploring Phoenix homes for sale will find new-build subdivisions, golf course communities, and mid-century ranch homes across a metro known for its warm climate and lower cost of living than coastal California.",
    neighborhoods: ["Arcadia", "Biltmore", "Downtown Phoenix", "Ahwatukee", "North Phoenix", "Desert Ridge"],
    schools: [
      { name: "Arizona State University", rating: "8/10", type: "University" },
      { name: "BASIS Phoenix", rating: "10/10", type: "Public Charter" },
    ],
    faqs: [
      { q: "Is now a good time to buy Phoenix real estate?", a: "Phoenix remains attractive for its population growth and job creation, though buyers should watch for seasonal inventory swings and rising summer cooling costs when budgeting." },
      { q: "What is the median home price in Phoenix?", a: "The median home price in Phoenix is approximately $435,000, with premium pricing in Arcadia and Biltmore and more accessible entry points in outer suburbs like Ahwatukee." },
    ],
  },
  philadelphia: {
    name: "Philadelphia",
    state: "Pennsylvania",
    country: "USA",
    population: "1,567,258",
    medianIncome: "$57,537",
    medianHomePrice: "$260,000",
    description: "Philadelphia real estate is anchored by iconic rowhomes, converted lofts, and a historic core, offering some of the most affordable big-city housing on the East Coast. Philadelphia homes for sale range from Fishtown's renovated trinities to Center City high-rise condos, appealing to buyers priced out of New York and Boston.",
    neighborhoods: ["Fishtown", "Rittenhouse Square", "Northern Liberties", "Society Hill", "Fairmount", "Manayunk"],
    schools: [
      { name: "University of Pennsylvania", rating: "10/10", type: "University" },
      { name: "Julia R. Masterman School", rating: "10/10", type: "Public" },
    ],
    faqs: [
      { q: "Why are Philadelphia homes for sale cheaper than other East Coast cities?", a: "Philadelphia's dense rowhome stock and historically lower demand relative to New York and DC keep prices comparatively low, though gentrifying neighborhoods like Fishtown have seen rapid appreciation." },
      { q: "What is Philadelphia's real estate transfer tax?", a: "Philadelphia levies one of the higher combined city-and-state real estate transfer tax rates in the country, so buyers should budget for it as a significant closing cost." },
    ],
  },
  "san-antonio": {
    name: "San Antonio",
    state: "Texas",
    country: "USA",
    population: "1,472,909",
    medianIncome: "$58,394",
    medianHomePrice: "$285,000",
    description: "San Antonio real estate combines Texas affordability with a strong military and healthcare employment base, making it one of the most budget-friendly large metros in the state. San Antonio homes for sale span historic King William bungalows to new-build suburbs stretching toward the Hill Country.",
    neighborhoods: ["Alamo Heights", "King William", "Stone Oak", "The Pearl", "Southtown", "Boerne"],
    schools: [
      { name: "Trinity University", rating: "9/10", type: "University" },
      { name: "Basis San Antonio", rating: "10/10", type: "Public Charter" },
    ],
    faqs: [
      { q: "Is San Antonio a good place to invest in real estate?", a: "San Antonio's growing population, military bases, and below-average home prices relative to Austin and Dallas make it attractive for both owner-occupants and rental investors." },
      { q: "What are the best San Antonio neighborhoods?", a: "Alamo Heights and King William offer historic character close to downtown, while Stone Oak provides newer construction and top-rated schools further north." },
    ],
  },
  "san-diego": {
    name: "San Diego",
    state: "California",
    country: "USA",
    population: "1,381,162",
    medianIncome: "$96,974",
    medianHomePrice: "$975,000",
    description: "San Diego real estate blends year-round coastal living with a booming biotech and defense economy, keeping demand for San Diego homes for sale consistently high. From La Jolla's oceanfront estates to North Park's walkable bungalows, the market commands a premium for its climate and Pacific views.",
    neighborhoods: ["La Jolla", "North Park", "Point Loma", "Pacific Beach", "Del Mar", "Hillcrest"],
    schools: [
      { name: "University of California, San Diego", rating: "10/10", type: "University" },
      { name: "Canyon Crest Academy", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is San Diego real estate so expensive?", a: "Limited coastal land supply, strict zoning, and strong demand from the biotech, defense, and tourism sectors keep San Diego home prices among the highest in the country." },
      { q: "What is the median home price in San Diego?", a: "The median home price in San Diego is approximately $975,000, with oceanfront neighborhoods like La Jolla and Del Mar commanding significantly more." },
    ],
  },
  dallas: {
    name: "Dallas",
    state: "Texas",
    country: "USA",
    population: "1,304,379",
    medianIncome: "$62,318",
    medianHomePrice: "$400,000",
    description: "Dallas real estate benefits from a business-friendly, no-state-income-tax environment that has drawn a steady wave of corporate relocations and Fortune 500 headquarters to the Metroplex. Dallas homes for sale range from Uptown high-rise condos to sprawling new-construction suburbs in Frisco and Plano.",
    neighborhoods: ["Uptown", "Highland Park", "Bishop Arts District", "Lakewood", "Preston Hollow", "Deep Ellum"],
    schools: [
      { name: "Southern Methodist University", rating: "9/10", type: "University" },
      { name: "School for the Talented and Gifted", rating: "10/10", type: "Public" },
    ],
    faqs: [
      { q: "Why are companies relocating to Dallas real estate?", a: "Texas's lack of state income tax, central US location, and lower cost of living compared to coastal metros have driven major corporate relocations to Dallas-Fort Worth, fueling housing demand." },
      { q: "What are the top Dallas neighborhoods for buyers?", a: "Highland Park and Preston Hollow offer luxury estates, while Bishop Arts District and Deep Ellum attract buyers seeking walkable, arts-driven urban living." },
    ],
  },
  "san-jose": {
    name: "San Jose",
    state: "California",
    country: "USA",
    population: "971,233",
    medianIncome: "$126,094",
    medianHomePrice: "$1,450,000",
    description: "San Jose real estate sits at the heart of Silicon Valley, where proximity to major tech employers keeps San Jose homes for sale among the most expensive in the nation. Buyers compete for a limited supply of single-family homes across Willow Glen, Almaden Valley, and the booming North San Jose tech corridor.",
    neighborhoods: ["Willow Glen", "Almaden Valley", "Rose Garden", "North San Jose", "Evergreen", "Cambrian Park"],
    schools: [
      { name: "San Jose State University", rating: "8/10", type: "University" },
      { name: "Lynbrook High School", rating: "10/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is San Jose real estate the most expensive in the country?", a: "San Jose's position at the center of Silicon Valley, with high-paying tech employers and severely constrained housing supply, keeps median home prices among the highest of any US metro." },
      { q: "Is San Jose a good market for real estate investors?", a: "High purchase prices mean lower rental yields, but San Jose's strong income base and persistent housing shortage have historically supported long-term appreciation." },
    ],
  },
  austin: {
    name: "Austin",
    state: "Texas",
    country: "USA",
    population: "961,855",
    medianIncome: "$86,550",
    medianHomePrice: "$550,000",
    description: "Austin real estate has been shaped by a wave of tech-sector migration, live music culture, and Texas's no-income-tax advantage, pushing Austin homes for sale prices up sharply over the past decade even after a recent cooling. From East Austin bungalows to Lake Travis waterfront estates, the market spans both hip urban infill and hill-country luxury.",
    neighborhoods: ["East Austin", "Zilker", "Travis Heights", "Mueller", "West Lake Hills", "South Congress"],
    schools: [
      { name: "University of Texas at Austin", rating: "9/10", type: "University" },
      { name: "Liberal Arts and Science Academy", rating: "10/10", type: "Public" },
    ],
    faqs: [
      { q: "Has the Austin real estate market cooled down?", a: "After a pandemic-era surge, Austin home prices have moderated from their 2022 peak, giving buyers more negotiating leverage while the metro's long-term tech-driven growth trend continues." },
      { q: "What is the median home price in Austin?", a: "The median home price in Austin is approximately $550,000, with West Lake Hills and Lake Travis commanding premium pricing and East Austin offering relatively more accessible entry points." },
    ],
  },
  jacksonville: {
    name: "Jacksonville",
    state: "Florida",
    country: "USA",
    population: "971,319",
    medianIncome: "$61,870",
    medianHomePrice: "$310,000",
    description: "Jacksonville real estate offers some of Florida's most affordable coastal living, combining no state income tax with a growing logistics, finance, and healthcare job base. Jacksonville homes for sale range from riverfront properties along the St. Johns River to beach cottages in Atlantic Beach and Ponte Vedra.",
    neighborhoods: ["Riverside", "San Marco", "Atlantic Beach", "Ponte Vedra", "Avondale", "Southside"],
    schools: [
      { name: "University of North Florida", rating: "7/10", type: "University" },
      { name: "Stanton College Preparatory School", rating: "10/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Jacksonville real estate a good value compared to other Florida cities?", a: "Jacksonville consistently prices below Miami, Tampa, and Orlando while still offering beach access and no state income tax, making it a favorite for buyers seeking Florida affordability." },
      { q: "What should buyers know about flood risk in Jacksonville?", a: "As a coastal, riverfront city, flood insurance costs vary significantly by neighborhood, so buyers should check FEMA flood zone maps before purchasing near the St. Johns River or beaches." },
    ],
  },
  "fort-worth": {
    name: "Fort Worth",
    state: "Texas",
    country: "USA",
    population: "956,709",
    medianIncome: "$68,222",
    medianHomePrice: "$335,000",
    description: "Fort Worth real estate offers a lower-cost, family-oriented alternative to neighboring Dallas, with historic Stockyards charm alongside fast-growing new-construction suburbs. Fort Worth homes for sale attract buyers priced out of Dallas proper without sacrificing DFW Metroplex job access.",
    neighborhoods: ["Cultural District", "Sundance Square", "TCU/West Cliff", "Near Southside", "Alliance", "Fossil Creek"],
    schools: [
      { name: "Texas Christian University", rating: "8/10", type: "University" },
      { name: "Paschal High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Fort Worth cheaper than Dallas real estate?", a: "Yes, Fort Worth homes for sale typically price below comparable Dallas listings while offering similar access to the broader Metroplex job market, making it popular with first-time buyers." },
      { q: "What are the best growing areas in Fort Worth?", a: "Alliance and Fossil Creek in north Fort Worth have seen rapid new-construction growth thanks to logistics and corporate employment expansion along the I-35W corridor." },
    ],
  },
  columbus: {
    name: "Columbus",
    state: "Ohio",
    country: "USA",
    population: "913,175",
    medianIncome: "$59,222",
    medianHomePrice: "$275,000",
    description: "Columbus real estate has quietly become one of the Midwest's strongest growth markets, fueled by Ohio State University, Intel's new semiconductor campus, and a diverse insurance and tech employment base. Columbus homes for sale remain affordable relative to income, drawing steady interstate migration.",
    neighborhoods: ["German Village", "Short North", "Clintonville", "Grandview Heights", "Dublin", "Bexley"],
    schools: [
      { name: "Ohio State University", rating: "8/10", type: "University" },
      { name: "Bexley High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Columbus real estate attracting new residents?", a: "Major investments like Intel's semiconductor plant and Ohio State's research economy have driven job growth, pushing Columbus home prices up while still remaining affordable compared to coastal metros." },
      { q: "What is the median home price in Columbus?", a: "The median home price in Columbus is approximately $275,000, with German Village and Bexley commanding a premium for historic character and top school ratings." },
    ],
  },
  charlotte: {
    name: "Charlotte",
    state: "North Carolina",
    country: "USA",
    population: "897,720",
    medianIncome: "$71,772",
    medianHomePrice: "$405,000",
    description: "Charlotte real estate has surged alongside its rise as the nation's second-largest banking hub, with corporate relocations from the Northeast fueling demand for Charlotte homes for sale. New-construction suburbs ring a rapidly densifying uptown core lined with luxury high-rises.",
    neighborhoods: ["South End", "Myers Park", "NoDa", "Dilworth", "Ballantyne", "SouthPark"],
    schools: [
      { name: "Davidson College", rating: "9/10", type: "University" },
      { name: "Providence High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Charlotte real estate booming?", a: "Charlotte's status as a major banking and finance hub, combined with a business-friendly tax climate, has driven strong corporate relocation and population growth, pushing home values steadily higher." },
      { q: "What are the best Charlotte neighborhoods for young professionals?", a: "South End and NoDa offer walkable, transit-connected living near uptown, while Dilworth and Myers Park appeal to buyers wanting historic charm closer to the city center." },
    ],
  },
  indianapolis: {
    name: "Indianapolis",
    state: "Indiana",
    country: "USA",
    population: "887,642",
    medianIncome: "$54,325",
    medianHomePrice: "$235,000",
    description: "Indianapolis real estate remains one of the most affordable big-city markets in the Midwest, anchored by a logistics-heavy economy and a growing downtown residential scene. Indianapolis homes for sale offer strong rental cash flow for investors alongside family-friendly suburban options.",
    neighborhoods: ["Broad Ripple", "Fountain Square", "Meridian-Kessler", "Carmel", "Irvington", "Downtown"],
    schools: [
      { name: "Butler University", rating: "8/10", type: "University" },
      { name: "Carmel High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Indianapolis good for real estate investors?", a: "Indianapolis is frequently cited by investors for its strong rent-to-price ratios, landlord-friendly regulations, and steady population growth in surrounding Carmel and Fishers suburbs." },
      { q: "What is the median home price in Indianapolis?", a: "The median home price in Indianapolis is approximately $235,000, among the most affordable of any major US metro, with Carmel commanding a premium for schools." },
    ],
  },
  "san-francisco": {
    name: "San Francisco",
    state: "California",
    country: "USA",
    population: "808,437",
    medianIncome: "$126,187",
    medianHomePrice: "$1,300,000",
    description: "San Francisco real estate remains defined by extreme land scarcity, strict height limits, and proximity to the world's largest concentration of tech wealth, keeping San Francisco homes for sale among the priciest in the country despite recent price corrections. Victorian-era homes, view condos, and Pacific Heights mansions define a market unlike any other.",
    neighborhoods: ["Pacific Heights", "Noe Valley", "Mission District", "Marina District", "Russian Hill", "SoMa"],
    schools: [
      { name: "University of San Francisco", rating: "8/10", type: "University" },
      { name: "Lowell High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Has San Francisco real estate recovered from its post-pandemic dip?", a: "San Francisco home prices softened after 2020 as remote work reduced downtown demand, but well-located neighborhoods like Noe Valley and Pacific Heights have shown renewed price stability." },
      { q: "Why is it so hard to buy a home in San Francisco?", a: "Strict zoning, limited buildable land on a 7-by-7-mile peninsula, and concentrated high-income tech employment combine to keep San Francisco's housing supply chronically tight." },
    ],
  },
  seattle: {
    name: "Seattle",
    state: "Washington",
    country: "USA",
    population: "749,256",
    medianIncome: "$105,391",
    medianHomePrice: "$820,000",
    description: "Seattle real estate is powered by Amazon, Microsoft, and a deep bench of tech employers, plus Washington's lack of a state income tax, which together keep demand for Seattle homes for sale strong despite persistent rain and traffic complaints. Craftsman bungalows in Ballard and view condos downtown both command premium pricing.",
    neighborhoods: ["Ballard", "Capitol Hill", "Queen Anne", "Fremont", "West Seattle", "Bellevue"],
    schools: [
      { name: "University of Washington", rating: "9/10", type: "University" },
      { name: "Garfield High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Seattle real estate expensive despite no state income tax?", a: "The absence of state income tax boosts take-home pay for Seattle's large tech workforce, which in turn fuels competitive bidding on a housing supply constrained by water, mountains, and strict zoning." },
      { q: "What is the median home price in Seattle?", a: "The median home price in Seattle is approximately $820,000, with premium neighborhoods like Queen Anne and Capitol Hill pricing well above the metro average." },
    ],
  },
  denver: {
    name: "Denver",
    state: "Colorado",
    country: "USA",
    population: "715,522",
    medianIncome: "$78,177",
    medianHomePrice: "$565,000",
    description: "Denver real estate has ridden a decade-long wave of migration from coastal states drawn to Colorado's mountain lifestyle, craft beer scene, and outdoor recreation access. Denver homes for sale in walkable urban neighborhoods now compete with fast-growing suburbs stretching toward the Front Range.",
    neighborhoods: ["LoDo", "Highlands", "Wash Park", "Cherry Creek", "Five Points", "Stapleton/Central Park"],
    schools: [
      { name: "University of Denver", rating: "8/10", type: "University" },
      { name: "East High School", rating: "7/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Denver real estate still appreciating?", a: "Denver's growth has moderated from its 2021 peak but continues to outpace many Midwest and Southern metros thanks to sustained in-migration and a diversified aerospace, tech, and outdoor-industry economy." },
      { q: "What are the priciest Denver neighborhoods?", a: "Cherry Creek and Wash Park command the highest per-square-foot prices in Denver, prized for walkability, parks, and proximity to downtown." },
    ],
  },
  washington: {
    name: "Washington",
    state: "D.C.",
    country: "USA",
    population: "678,972",
    medianIncome: "$101,027",
    medianHomePrice: "$650,000",
    description: "Washington D.C. real estate benefits from a recession-resistant federal employment base, world-class universities, and a dense network of historic rowhome neighborhoods. D.C. homes for sale range from Georgetown's colonial-era townhouses to Navy Yard's new-construction waterfront condos.",
    neighborhoods: ["Georgetown", "Capitol Hill", "Dupont Circle", "Navy Yard", "Logan Circle", "Petworth"],
    schools: [
      { name: "Georgetown University", rating: "10/10", type: "University" },
      { name: "Benjamin Banneker Academic High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Is D.C. real estate a stable investment?", a: "Washington's federal government and lobbying-driven economy has historically provided more price stability through recessions than many other major metros, though high property taxes and co-op fees are common in older buildings." },
      { q: "What is the median home price in Washington D.C.?", a: "The median home price in D.C. is approximately $650,000, with Georgetown and Dupont Circle commanding well above that and up-and-coming Petworth offering relative value." },
    ],
  },
  nashville: {
    name: "Nashville",
    state: "Tennessee",
    country: "USA",
    population: "689,447",
    medianIncome: "$67,275",
    medianHomePrice: "$470,000",
    description: "Nashville real estate has boomed as one of the country's fastest-growing metros, fueled by no state income tax, a thriving music and healthcare industry, and steady corporate relocations. Nashville homes for sale range from East Nashville bungalows to new luxury towers rising near Music Row.",
    neighborhoods: ["East Nashville", "Germantown", "The Gulch", "12 South", "Green Hills", "Belle Meade"],
    schools: [
      { name: "Vanderbilt University", rating: "9/10", type: "University" },
      { name: "Hume-Fogg Academic Magnet School", rating: "10/10", type: "Public" },
    ],
    faqs: [
      { q: "Why has Nashville real estate grown so fast?", a: "No state income tax, a business-friendly climate, and Nashville's healthcare and entertainment industries have drawn sustained corporate and population growth, pushing home prices up sharply over the past decade." },
      { q: "What are the trendiest Nashville neighborhoods?", a: "12 South and East Nashville lead in walkability and dining scenes, while The Gulch offers new-construction high-rise living within walking distance of downtown." },
    ],
  },
  "oklahoma-city": {
    name: "Oklahoma City",
    state: "Oklahoma",
    country: "USA",
    population: "681,054",
    medianIncome: "$59,391",
    medianHomePrice: "$235,000",
    description: "Oklahoma City real estate remains one of the most affordable major metros in the country, supported by an energy, aviation, and government employment base and minimal zoning restrictions that keep new construction flowing. Oklahoma City homes for sale offer strong value for both first-time buyers and investors.",
    neighborhoods: ["Midtown", "Paseo Arts District", "Nichols Hills", "Edmond", "Bricktown", "Automobile Alley"],
    schools: [
      { name: "University of Oklahoma", rating: "8/10", type: "University" },
      { name: "Casady School", rating: "9/10", type: "Private" },
    ],
    faqs: [
      { q: "Is Oklahoma City a good market for real estate investors?", a: "Low purchase prices combined with steady rental demand make Oklahoma City one of the higher cash-flow markets in the country for buy-and-hold investors." },
      { q: "What is the median home price in Oklahoma City?", a: "The median home price in Oklahoma City is approximately $235,000, among the lowest of any major US metro, with Nichols Hills and Edmond commanding premium pricing." },
    ],
  },
  "el-paso": {
    name: "El Paso",
    state: "Texas",
    country: "USA",
    population: "678,815",
    medianIncome: "$52,772",
    medianHomePrice: "$210,000",
    description: "El Paso real estate offers exceptional affordability along the US-Mexico border, supported by a large military presence at Fort Bliss and growing cross-border trade and manufacturing. El Paso homes for sale are among the lowest-priced of any major Texas metro.",
    neighborhoods: ["Kern Place", "Coronado", "Mission Hills", "Westside", "Eastside", "Downtown"],
    schools: [
      { name: "University of Texas at El Paso", rating: "7/10", type: "University" },
      { name: "Coronado High School", rating: "7/10", type: "Public" },
    ],
    faqs: [
      { q: "Is El Paso real estate affordable for first-time buyers?", a: "Yes, El Paso's median home price is well below the Texas and national averages, making it one of the most accessible markets in the state for first-time buyers." },
      { q: "How does Fort Bliss affect El Paso's housing market?", a: "Fort Bliss's large military population creates consistent rental and starter-home demand near the base, supporting steady turnover in neighborhoods like Westside and Eastside." },
    ],
  },
  boston: {
    name: "Boston",
    state: "Massachusetts",
    country: "USA",
    population: "650,706",
    medianIncome: "$79,772",
    medianHomePrice: "$820,000",
    description: "Boston real estate is shaped by a dense concentration of world-class universities, hospitals, and biotech firms, keeping demand for Boston homes for sale consistently strong despite a historically constrained housing supply. Brick rowhouses in Back Bay and triple-deckers in Dorchester both reflect the city's colonial-era housing stock.",
    neighborhoods: ["Back Bay", "South End", "Beacon Hill", "Jamaica Plain", "Charlestown", "Seaport"],
    schools: [
      { name: "Harvard University", rating: "10/10", type: "University" },
      { name: "Boston Latin School", rating: "10/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Boston real estate so expensive?", a: "A dense cluster of top universities and hospitals draws high-income professionals to a city with limited buildable land, keeping Boston home prices among the highest in the Northeast." },
      { q: "What is the median home price in Boston?", a: "The median home price in Boston is approximately $820,000, with Back Bay and Beacon Hill commanding significant premiums for historic character and central location." },
    ],
  },
  portland: {
    name: "Portland",
    state: "Oregon",
    country: "USA",
    population: "635,067",
    medianIncome: "$76,231",
    medianHomePrice: "$540,000",
    description: "Portland real estate combines Pacific Northwest livability with Oregon's lack of a state sales tax, drawing buyers to Portland homes for sale across a mix of craftsman bungalows, close-in bungalow neighborhoods, and newer infill construction. Urban growth boundaries have historically constrained sprawl and supported long-term price appreciation.",
    neighborhoods: ["Pearl District", "Alberta Arts District", "Sellwood", "Hawthorne", "Irvington", "Mount Tabor"],
    schools: [
      { name: "Portland State University", rating: "7/10", type: "University" },
      { name: "Lincoln High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "How has Portland's urban growth boundary affected home prices?", a: "Oregon's statewide urban growth boundary policy limits outward sprawl around Portland, constraining new supply and contributing to long-term appreciation in close-in neighborhoods." },
      { q: "What is the median home price in Portland?", a: "The median home price in Portland is approximately $540,000, with the Pearl District and Irvington commanding premiums for walkability and historic character." },
    ],
  },
  "las-vegas": {
    name: "Las Vegas",
    state: "Nevada",
    country: "USA",
    population: "656,274",
    medianIncome: "$58,631",
    medianHomePrice: "$425,000",
    description: "Las Vegas real estate has surged as retirees, remote workers, and Californians priced out of the coast flock to Nevada's lack of state income tax and lower cost of living. Las Vegas homes for sale span master-planned communities like Summerlin to condo towers along the Strip.",
    neighborhoods: ["Summerlin", "Henderson", "The Lakes", "Green Valley", "Spring Valley", "Downtown"],
    schools: [
      { name: "University of Nevada, Las Vegas", rating: "7/10", type: "University" },
      { name: "Coronado High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Why are Californians moving to Las Vegas real estate?", a: "No state income tax, significantly lower home prices than California, and a short flight or drive back to the coast have made Las Vegas a top relocation destination for Californians." },
      { q: "Is Las Vegas a good market for real estate investors?", a: "Strong population growth and steady tourism-driven rental demand, especially near the Strip and Henderson, support both long-term and short-term rental investment strategies." },
    ],
  },
  memphis: {
    name: "Memphis",
    state: "Tennessee",
    country: "USA",
    population: "633,104",
    medianIncome: "$45,801",
    medianHomePrice: "$180,000",
    description: "Memphis real estate is one of the most affordable major metros in the country, anchored by FedEx's global hub and a deep logistics and distribution employment base. Memphis homes for sale are frequently targeted by out-of-state investors for their strong rental yields.",
    neighborhoods: ["Midtown", "Cooper-Young", "Germantown", "Downtown/South Main", "East Memphis", "Harbor Town"],
    schools: [
      { name: "Rhodes College", rating: "8/10", type: "University" },
      { name: "White Station High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Why do investors target Memphis real estate?", a: "Memphis combines some of the lowest home prices among major metros with steady rental demand tied to its FedEx-anchored logistics economy, producing strong cash-on-cash returns for buy-and-hold investors." },
      { q: "What is the median home price in Memphis?", a: "The median home price in Memphis is approximately $180,000, among the most affordable of any major US city, with East Memphis and Germantown pricing above the metro average." },
    ],
  },
  louisville: {
    name: "Louisville",
    state: "Kentucky",
    country: "USA",
    population: "628,594",
    medianIncome: "$56,662",
    medianHomePrice: "$245,000",
    description: "Louisville real estate offers Midwest-level affordability with Southern charm, supported by a logistics hub (UPS Worldport), bourbon tourism, and horse racing industry. Louisville homes for sale include historic Old Louisville mansions and family-friendly suburban new construction.",
    neighborhoods: ["Highlands", "Old Louisville", "St. Matthews", "NuLu", "Crescent Hill", "Jeffersontown"],
    schools: [
      { name: "University of Louisville", rating: "7/10", type: "University" },
      { name: "duPont Manual High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Louisville real estate affordable for first-time buyers?", a: "Yes, Louisville's median home price sits well below the national average, and the Highlands and St. Matthews areas offer walkable, amenity-rich living at a relative discount to larger metros." },
      { q: "How does UPS Worldport affect Louisville's economy and housing?", a: "As UPS's global air hub, Louisville benefits from steady logistics employment, which supports consistent housing demand in southern Jefferson County near the airport." },
    ],
  },
  baltimore: {
    name: "Baltimore",
    state: "Maryland",
    country: "USA",
    population: "585,708",
    medianIncome: "$54,124",
    medianHomePrice: "$225,000",
    description: "Baltimore real estate offers rowhome-dense, historic neighborhoods at a significant discount to nearby Washington D.C., with strong healthcare and biotech employment anchored by Johns Hopkins. Baltimore homes for sale include renovated Federal Hill rowhouses and waterfront condos in Harbor East.",
    neighborhoods: ["Federal Hill", "Fells Point", "Canton", "Harbor East", "Roland Park", "Hampden"],
    schools: [
      { name: "Johns Hopkins University", rating: "10/10", type: "University" },
      { name: "Baltimore City College", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Baltimore cheaper than Washington D.C. real estate?", a: "Significantly — Baltimore's median home price runs well below D.C.'s, making it a popular option for buyers who work in D.C. but want a shorter commute-for-cost tradeoff via MARC rail." },
      { q: "What are the best Baltimore neighborhoods near the waterfront?", a: "Fells Point, Canton, and Harbor East all offer walkable waterfront living with restaurants and marinas within Baltimore's historic urban core." },
    ],
  },
  milwaukee: {
    name: "Milwaukee",
    state: "Wisconsin",
    country: "USA",
    population: "577,222",
    medianIncome: "$47,981",
    medianHomePrice: "$220,000",
    description: "Milwaukee real estate offers Great Lakes affordability with a growing craft beer, manufacturing, and healthcare economy. Milwaukee homes for sale range from historic Bay View bungalows to lakefront condos downtown, appealing to buyers priced out of Chicago just 90 miles south.",
    neighborhoods: ["Bay View", "Third Ward", "East Side", "Walker's Point", "Shorewood", "Wauwatosa"],
    schools: [
      { name: "Marquette University", rating: "8/10", type: "University" },
      { name: "Rufus King International School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Milwaukee a good alternative to Chicago real estate?", a: "Milwaukee offers similar Great Lakes urban living at a fraction of Chicago's home prices, with a direct Amtrak connection making it viable for buyers who occasionally commute south." },
      { q: "What is the median home price in Milwaukee?", a: "The median home price in Milwaukee is approximately $220,000, with the Third Ward and East Side commanding premiums for walkability and lakefront proximity." },
    ],
  },
  albuquerque: {
    name: "Albuquerque",
    state: "New Mexico",
    country: "USA",
    population: "564,559",
    medianIncome: "$58,722",
    medianHomePrice: "$310,000",
    description: "Albuquerque real estate offers high-desert affordability with a growing film, aerospace, and film-production economy, plus proximity to Sandia National Laboratories. Albuquerque homes for sale include adobe-style Southwest architecture and newer construction in the Northeast Heights.",
    neighborhoods: ["Nob Hill", "Northeast Heights", "Old Town", "North Valley", "Downtown", "Sandia Heights"],
    schools: [
      { name: "University of New Mexico", rating: "7/10", type: "University" },
      { name: "La Cueva High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Albuquerque real estate affordable compared to other Southwest cities?", a: "Yes, Albuquerque prices well below Phoenix, Denver, and Las Vegas, making it an accessible entry point into Southwest real estate for buyers and investors." },
      { q: "What industries support Albuquerque's housing demand?", a: "Sandia National Laboratories, a growing film production industry, and Kirtland Air Force Base provide a stable employment base supporting steady housing demand." },
    ],
  },
  tucson: {
    name: "Tucson",
    state: "Arizona",
    country: "USA",
    population: "542,629",
    medianIncome: "$48,747",
    medianHomePrice: "$310,000",
    description: "Tucson real estate attracts retirees and University of Arizona-affiliated buyers with its Sonoran Desert scenery and lower price point than Phoenix. Tucson homes for sale span mid-century ranch homes near downtown to golf course communities in the foothills.",
    neighborhoods: ["Sam Hughes", "Catalina Foothills", "Downtown", "Oro Valley", "Barrio Viejo", "Sabino Canyon"],
    schools: [
      { name: "University of Arizona", rating: "8/10", type: "University" },
      { name: "University High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Tucson cheaper than Phoenix real estate?", a: "Yes, Tucson home prices generally run below Phoenix's, offering similar desert-climate living at a more accessible price point, particularly appealing to retirees and University of Arizona families." },
      { q: "What are the best Tucson neighborhoods for retirees?", a: "Catalina Foothills and Oro Valley are popular with retirees for their mountain views, golf communities, and proximity to healthcare facilities." },
    ],
  },
  fresno: {
    name: "Fresno",
    state: "California",
    country: "USA",
    population: "545,716",
    medianIncome: "$56,013",
    medianHomePrice: "$390,000",
    description: "Fresno real estate offers one of California's most affordable entry points, anchored by the Central Valley's massive agricultural economy. Fresno homes for sale price dramatically below coastal California while still offering a two-hour drive to Yosemite and the Sierra Nevada.",
    neighborhoods: ["Tower District", "Woodward Park", "Fig Garden", "Sunnyside", "Downtown", "Copper River"],
    schools: [
      { name: "California State University, Fresno", rating: "6/10", type: "University" },
      { name: "Bullard High School", rating: "7/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Fresno real estate cheaper than coastal California?", a: "Fresno's inland Central Valley location, away from coastal job centers and land constraints, keeps home prices at roughly half the statewide coastal average while remaining within California." },
      { q: "Is Fresno a good market for real estate investors?", a: "Fresno's affordability relative to rents, driven by steady agricultural and Fresno State-area demand, has made it a growing target for California-based buy-and-hold investors." },
    ],
  },
  sacramento: {
    name: "Sacramento",
    state: "California",
    country: "USA",
    population: "524,943",
    medianIncome: "$71,032",
    medianHomePrice: "$530,000",
    description: "Sacramento real estate has benefited from Bay Area buyers seeking relief from San Francisco and San Jose prices, while retaining California's state capital government employment base. Sacramento homes for sale include Victorian-era homes in Midtown and new-construction suburbs in Elk Grove and Folsom.",
    neighborhoods: ["Midtown", "East Sacramento", "Land Park", "Elk Grove", "Folsom", "Curtis Park"],
    schools: [
      { name: "University of California, Davis", rating: "9/10", type: "University" },
      { name: "West Campus High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Why are Bay Area residents moving to Sacramento real estate?", a: "Sacramento offers roughly half the median home price of San Francisco or San Jose with a manageable commute or remote-work flexibility, driving steady in-state migration." },
      { q: "What is the median home price in Sacramento?", a: "The median home price in Sacramento is approximately $530,000, with Folsom and East Sacramento commanding premiums for schools and walkability." },
    ],
  },
  mesa: {
    name: "Mesa",
    state: "Arizona",
    country: "USA",
    population: "504,258",
    medianIncome: "$65,850",
    medianHomePrice: "$430,000",
    description: "Mesa real estate has grown into a major East Valley hub in its own right, with a booming semiconductor and aerospace manufacturing base alongside its traditional retiree appeal. Mesa homes for sale range from established 55-plus communities to new-construction subdivisions near the Phoenix-Mesa Gateway corridor.",
    neighborhoods: ["Eastmark", "Val Vista Lakes", "Dobson Ranch", "Las Sendas", "Downtown Mesa", "Red Mountain Ranch"],
    schools: [
      { name: "Arizona State University Polytechnic", rating: "7/10", type: "University" },
      { name: "Mountain View High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Mesa a good alternative to Phoenix real estate?", a: "Mesa offers newer housing stock and often lower prices than central Phoenix, with strong job growth from semiconductor manufacturers expanding in the East Valley." },
      { q: "What is Mesa known for among homebuyers?", a: "Mesa is popular with retirees for its numerous 55-plus communities like Val Vista Lakes, while Eastmark attracts younger families with new-construction master planning." },
    ],
  },
  "kansas-city": {
    name: "Kansas City",
    state: "Missouri",
    country: "USA",
    population: "508,090",
    medianIncome: "$61,401",
    medianHomePrice: "$260,000",
    description: "Kansas City real estate spans two states along the Missouri-Kansas border, offering affordable, family-friendly living with a growing logistics, animal health, and tech-startup economy. Kansas City homes for sale include Country Club Plaza's Spanish Revival architecture and newer suburbs in Overland Park.",
    neighborhoods: ["Country Club Plaza", "Westport", "Brookside", "Overland Park", "River Market", "Waldo"],
    schools: [
      { name: "University of Missouri–Kansas City", rating: "6/10", type: "University" },
      { name: "Blue Valley North High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Kansas City real estate affordable?", a: "Yes, Kansas City's median home price sits well below the national average, and the metro is frequently ranked among the best for first-time buyer affordability relative to income." },
      { q: "What are the best Kansas City suburbs?", a: "Overland Park on the Kansas side is known for top-rated schools, while Brookside and Waldo on the Missouri side offer walkable, historic character close to downtown." },
    ],
  },
  atlanta: {
    name: "Atlanta",
    state: "Georgia",
    country: "USA",
    population: "499,127",
    medianIncome: "$69,164",
    medianHomePrice: "$420,000",
    description: "Atlanta real estate has boomed as a major film production, logistics, and Fortune 500 corporate hub, with the Beltline trail driving intense demand in once-overlooked intown neighborhoods. Atlanta homes for sale range from historic Craftsman bungalows in Grant Park to new luxury towers in Midtown.",
    neighborhoods: ["Midtown", "Buckhead", "Grant Park", "Old Fourth Ward", "Virginia-Highland", "Decatur"],
    schools: [
      { name: "Emory University", rating: "9/10", type: "University" },
      { name: "Grady High School", rating: "7/10", type: "Public" },
    ],
    faqs: [
      { q: "How has the Beltline affected Atlanta real estate?", a: "The Atlanta Beltline trail has driven significant price appreciation in adjacent neighborhoods like Old Fourth Ward and Grant Park, transforming once-industrial corridors into premium walkable districts." },
      { q: "Why do film and corporate relocations matter for Atlanta housing?", a: "Georgia's film tax incentives and Atlanta's status as a Fortune 500 hub have driven consistent job and population growth, sustaining housing demand across intown and suburban submarkets alike." },
    ],
  },
  omaha: {
    name: "Omaha",
    state: "Nebraska",
    country: "USA",
    population: "486,051",
    medianIncome: "$63,867",
    medianHomePrice: "$255,000",
    description: "Omaha real estate offers heartland affordability with an outsized financial-sector presence anchored by Berkshire Hathaway and a growing logistics and insurance economy. Omaha homes for sale are known for strong value retention and low property tax volatility relative to coastal markets.",
    neighborhoods: ["Dundee", "Aksarben Village", "Blackstone District", "West Omaha", "Benson", "Elkhorn"],
    schools: [
      { name: "Creighton University", rating: "8/10", type: "University" },
      { name: "Westside High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Omaha a stable real estate market?", a: "Omaha's diversified economy — anchored by Berkshire Hathaway, insurance, and logistics employers — has historically produced steadier, less volatile price growth than many boom-and-bust coastal metros." },
      { q: "What is the median home price in Omaha?", a: "The median home price in Omaha is approximately $255,000, with Dundee and Aksarben Village commanding a premium for walkability and dining." },
    ],
  },
  "colorado-springs": {
    name: "Colorado Springs",
    state: "Colorado",
    country: "USA",
    population: "486,248",
    medianIncome: "$70,417",
    medianHomePrice: "$460,000",
    description: "Colorado Springs real estate benefits from a heavy military presence — including the US Air Force Academy and NORAD — alongside stunning Front Range mountain views. Colorado Springs homes for sale offer relative affordability compared to Denver while retaining Colorado's outdoor-lifestyle appeal.",
    neighborhoods: ["Old Colorado City", "Broadmoor", "Briargate", "Downtown", "Rockrimmon", "Cheyenne Cañon"],
    schools: [
      { name: "United States Air Force Academy", rating: "9/10", type: "University" },
      { name: "Cheyenne Mountain High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Colorado Springs cheaper than Denver real estate?", a: "Generally yes — Colorado Springs offers a meaningful discount to Denver home prices while still providing Front Range mountain access, making it popular with military families and remote workers." },
      { q: "How does the military affect Colorado Springs housing demand?", a: "With five major military installations nearby, Colorado Springs sees consistent rental and starter-home turnover tied to permanent-change-of-station relocations." },
    ],
  },
  raleigh: {
    name: "Raleigh",
    state: "North Carolina",
    country: "USA",
    population: "474,069",
    medianIncome: "$77,834",
    medianHomePrice: "$450,000",
    description: "Raleigh real estate anchors the Research Triangle alongside Durham and Chapel Hill, drawing tech and biotech employers and a highly educated workforce. Raleigh homes for sale in family-friendly suburbs consistently rank among the best-value markets for well-paying tech jobs.",
    neighborhoods: ["Five Points", "North Hills", "Downtown Raleigh", "Cameron Village", "Brier Creek", "Wakefield"],
    schools: [
      { name: "North Carolina State University", rating: "9/10", type: "University" },
      { name: "Enloe High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Raleigh popular with tech workers?", a: "As part of the Research Triangle Park ecosystem alongside Duke and UNC, Raleigh offers tech and biotech salaries with a meaningfully lower cost of living than Austin or the Bay Area." },
      { q: "What is the median home price in Raleigh?", a: "The median home price in Raleigh is approximately $450,000, with North Hills and Five Points commanding a premium for walkability and dining access." },
    ],
  },
  "long-beach": {
    name: "Long Beach",
    state: "California",
    country: "USA",
    population: "466,742",
    medianIncome: "$68,795",
    medianHomePrice: "$780,000",
    description: "Long Beach real estate offers a relatively more affordable slice of the LA County coastline, anchored by one of the busiest container ports in the world alongside a growing arts and craft-brewery scene. Long Beach homes for sale range from historic Craftsman homes in Bluff Park to waterfront condos downtown.",
    neighborhoods: ["Belmont Shore", "Bluff Park", "Naples", "Downtown", "Bixby Knolls", "California Heights"],
    schools: [
      { name: "California State University, Long Beach", rating: "8/10", type: "University" },
      { name: "Long Beach Polytechnic High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Long Beach cheaper than the rest of coastal LA?", a: "Long Beach generally prices below Santa Monica and Malibu while still offering direct beach access, making it a relatively accessible entry point into Southern California coastal living." },
      { q: "What are the best Long Beach neighborhoods near the water?", a: "Belmont Shore and Naples offer walkable canal and beach living, while Bluff Park is known for its preserved historic bluff-top homes overlooking the Pacific." },
    ],
  },
  "virginia-beach": {
    name: "Virginia Beach",
    state: "Virginia",
    country: "USA",
    population: "459,470",
    medianIncome: "$76,878",
    medianHomePrice: "$390,000",
    description: "Virginia Beach real estate is anchored by the largest concentration of US Navy and military personnel on the East Coast, supporting a steady stream of relocation and rental demand. Virginia Beach homes for sale range from oceanfront condos to family neighborhoods further inland near the Hampton Roads job centers.",
    neighborhoods: ["Sandbridge", "Great Neck", "Hilltop", "Kempsville", "Croatan", "Chesapeake Beach"],
    schools: [
      { name: "Old Dominion University", rating: "7/10", type: "University" },
      { name: "Cox High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "How does the military affect Virginia Beach real estate?", a: "As home to the world's largest naval base nearby in Norfolk, Virginia Beach sees consistent housing turnover from military relocations, supporting stable rental demand near the bases." },
      { q: "What is the median home price in Virginia Beach?", a: "The median home price in Virginia Beach is approximately $390,000, with oceanfront Sandbridge properties pricing well above inland neighborhoods like Kempsville." },
    ],
  },
  miami: {
    name: "Miami",
    state: "Florida",
    country: "USA",
    population: "449,514",
    medianIncome: "$44,581",
    medianHomePrice: "$610,000",
    description: "Miami real estate draws a uniquely international buyer pool, with no state income tax and heavy demand from Latin American, European, and Northeast US buyers for waterfront condos and luxury towers. Miami homes for sale span Brickell's dense high-rise skyline to Coral Gables' Mediterranean Revival estates.",
    neighborhoods: ["Brickell", "Coral Gables", "Coconut Grove", "Wynwood", "South Beach", "Edgewater"],
    schools: [
      { name: "University of Miami", rating: "9/10", type: "University" },
      { name: "Design and Architecture Senior High", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Why do international buyers favor Miami real estate?", a: "Miami's lack of state income tax, direct flights to Latin America and Europe, and status as a global finance and crypto hub make it a top destination for foreign buyers seeking a US real estate foothold." },
      { q: "What should Miami buyers know about hurricane and flood insurance?", a: "Miami's coastal exposure means flood and windstorm insurance can add significantly to carrying costs, particularly for waterfront condos in Brickell and South Beach — always factor this into your budget before buying." },
    ],
  },
  oakland: {
    name: "Oakland",
    state: "California",
    country: "USA",
    population: "440,646",
    medianIncome: "$79,138",
    medianHomePrice: "$780,000",
    description: "Oakland real estate offers a relatively more accessible entry point into the Bay Area than San Francisco, with a diverse arts scene and BART access to the region's tech job centers. Oakland homes for sale include Craftsman bungalows in Rockridge and hillside view homes in Montclair.",
    neighborhoods: ["Rockridge", "Montclair", "Temescal", "Lake Merritt", "Grand Lake", "Piedmont Avenue"],
    schools: [
      { name: "Mills College at Northeastern", rating: "7/10", type: "University" },
      { name: "Oakland Technical High School", rating: "7/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Oakland cheaper than San Francisco real estate?", a: "Yes, Oakland home prices typically run well below San Francisco's while still offering BART access to the city, making it a popular choice for Bay Area buyers seeking more space for the money." },
      { q: "What are the best Oakland neighborhoods for families?", a: "Rockridge and Montclair are consistently popular with families for their walkable commercial strips, hillside homes, and proximity to Bay Area tech commute corridors." },
    ],
  },
  minneapolis: {
    name: "Minneapolis",
    state: "Minnesota",
    country: "USA",
    population: "429,954",
    medianIncome: "$70,099",
    medianHomePrice: "$335,000",
    description: "Minneapolis real estate offers a strong balance of big-city amenities and Midwest affordability, supported by a high concentration of Fortune 500 headquarters and one of the country's best park systems. Minneapolis homes for sale span lakeside bungalows near the Chain of Lakes to downtown high-rise condos.",
    neighborhoods: ["Uptown", "North Loop", "Linden Hills", "Kingfield", "Northeast Minneapolis", "Lyn-Lake"],
    schools: [
      { name: "University of Minnesota", rating: "8/10", type: "University" },
      { name: "Southwest High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Why does Minneapolis have so many Fortune 500 companies?", a: "The Twin Cities' historic strength in agribusiness, retail, and healthcare has produced an unusually high concentration of major corporate headquarters relative to the metro's population, supporting stable high-wage employment." },
      { q: "What is the median home price in Minneapolis?", a: "The median home price in Minneapolis is approximately $335,000, with Linden Hills and Lake of the Isles-adjacent neighborhoods commanding the highest premiums." },
    ],
  },
  tulsa: {
    name: "Tulsa",
    state: "Oklahoma",
    country: "USA",
    population: "413,066",
    medianIncome: "$54,914",
    medianHomePrice: "$215,000",
    description: "Tulsa real estate remains one of the most affordable metros in the country, with a diversifying economy moving beyond its historic oil and gas roots into aerospace and remote-work incentive programs like Tulsa Remote. Tulsa homes for sale offer strong value in historic Art Deco neighborhoods.",
    neighborhoods: ["Brookside", "Cherry Street", "Maple Ridge", "Midtown", "Kendall-Whittier", "Brady Arts District"],
    schools: [
      { name: "University of Tulsa", rating: "8/10", type: "University" },
      { name: "Booker T. Washington High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "What is Tulsa Remote and how does it affect real estate?", a: "Tulsa Remote pays qualifying remote workers a cash incentive to relocate to Tulsa, which has helped attract new buyers to neighborhoods like Cherry Street and Brookside and supported steady home-price growth." },
      { q: "Is Tulsa a good market for real estate investors?", a: "Tulsa's low purchase prices relative to rents make it a frequently cited market for out-of-state buy-and-hold investors seeking strong cash-on-cash returns." },
    ],
  },
  tampa: {
    name: "Tampa",
    state: "Florida",
    country: "USA",
    population: "398,173",
    medianIncome: "$62,847",
    medianHomePrice: "$400,000",
    description: "Tampa real estate has been one of Florida's hottest markets, combining no state income tax with a growing finance, tech, and healthcare sector nicknamed \"Wall Street South.\" Tampa homes for sale range from waterfront properties on Tampa Bay to new-construction suburbs in Wesley Chapel.",
    neighborhoods: ["Hyde Park", "Davis Islands", "Seminole Heights", "South Tampa", "Ybor City", "Westshore"],
    schools: [
      { name: "University of Tampa", rating: "7/10", type: "University" },
      { name: "Plant High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Tampa called Wall Street South?", a: "A wave of financial services firms relocating operations to Tampa for its favorable tax climate and workforce has earned it the nickname, driving strong high-income housing demand in South Tampa and Westshore." },
      { q: "What is the median home price in Tampa?", a: "The median home price in Tampa is approximately $400,000, with waterfront Davis Islands and Hyde Park commanding significant premiums over inland neighborhoods." },
    ],
  },
  arlington: {
    name: "Arlington",
    state: "Texas",
    country: "USA",
    population: "394,266",
    medianIncome: "$66,131",
    medianHomePrice: "$310,000",
    description: "Arlington real estate sits squarely between Dallas and Fort Worth, offering family-friendly affordability alongside major entertainment draws like AT&T Stadium and Globe Life Field. Arlington homes for sale appeal to buyers who want Metroplex job access without Dallas or Fort Worth price tags.",
    neighborhoods: ["Viridian", "Dalworthington Gardens", "Pantego", "Downtown Arlington", "Southwest Arlington", "Rush Creek"],
    schools: [
      { name: "University of Texas at Arlington", rating: "7/10", type: "University" },
      { name: "Martin High School", rating: "7/10", type: "Public" },
    ],
    faqs: [
      { q: "Why do families choose Arlington over Dallas or Fort Worth?", a: "Arlington offers a lower cost of living than either neighboring city while sitting equidistant to both job markets, plus major entertainment venues that support local economic activity." },
      { q: "What is the median home price in Arlington, Texas?", a: "The median home price in Arlington is approximately $310,000, notably below both Dallas and Fort Worth's metro averages." },
    ],
  },
  "new-orleans": {
    name: "New Orleans",
    state: "Louisiana",
    country: "USA",
    population: "369,749",
    medianIncome: "$52,443",
    medianHomePrice: "$300,000",
    description: "New Orleans real estate offers unmatched historic architecture and culture, from Garden District mansions to French Quarter courtyards, supported by a tourism, port, and energy-driven economy. New Orleans homes for sale require careful attention to flood zones and insurance costs given the city's below-sea-level geography.",
    neighborhoods: ["Garden District", "French Quarter", "Bywater", "Uptown", "Mid-City", "Faubourg Marigny"],
    schools: [
      { name: "Tulane University", rating: "9/10", type: "University" },
      { name: "Benjamin Franklin High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "What should buyers know about flood insurance in New Orleans?", a: "Given the city's below-sea-level elevation, flood insurance is essentially mandatory and can be a major carrying cost — always check FEMA flood zone maps and levee protection before buying." },
      { q: "What is the median home price in New Orleans?", a: "The median home price in New Orleans is approximately $300,000, with Garden District and Uptown commanding significant premiums for historic architecture and higher elevation." },
    ],
  },
  wichita: {
    name: "Wichita",
    state: "Kansas",
    country: "USA",
    population: "397,532",
    medianIncome: "$54,236",
    medianHomePrice: "$200,000",
    description: "Wichita real estate remains highly affordable, anchored by a globally significant aviation manufacturing base including Textron, Spirit AeroSystems, and Cessna. Wichita homes for sale offer strong value for buyers seeking Midwest stability without coastal price tags.",
    neighborhoods: ["College Hill", "Riverside", "Delano", "Old Town", "Eastborough", "Northeast Heights"],
    schools: [
      { name: "Wichita State University", rating: "6/10", type: "University" },
      { name: "Wichita East High School", rating: "7/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Wichita called the Air Capital of the World?", a: "Wichita hosts major aircraft manufacturers including Spirit AeroSystems, Textron Aviation, and Learjet, providing a stable, high-wage manufacturing employment base that supports steady housing demand." },
      { q: "What is the median home price in Wichita?", a: "The median home price in Wichita is approximately $200,000, among the most affordable of any major US metro." },
    ],
  },
  toronto: {
    name: "Toronto",
    state: "Ontario",
    country: "Canada",
    population: "2,794,356",
    medianIncome: "C$85,000",
    medianHomePrice: "C$1,100,000",
    description: "Toronto real estate is Canada's largest and most liquid market, anchored by the country's dominant financial sector and persistent international immigration. Toronto homes for sale range from downtown condo towers to detached homes in family-oriented neighborhoods like The Beaches and Leaside.",
    neighborhoods: ["Yorkville", "The Beaches", "Leslieville", "Liberty Village", "Leaside", "The Annex"],
    schools: [
      { name: "University of Toronto", rating: "10/10", type: "University" },
      { name: "University of Toronto Schools", rating: "10/10", type: "Private" },
    ],
    faqs: [
      { q: "Why is Toronto real estate so expensive?", a: "Sustained international immigration, a dominant financial services sector, and land-constrained growth boundaries have kept Toronto home prices among the highest in North America." },
      { q: "What is the foreign buyer situation for Toronto real estate?", a: "Canada has implemented restrictions on non-resident foreign buyers in recent years — international buyers should confirm current eligibility rules before purchasing in Toronto." },
    ],
  },
  vancouver: {
    name: "Vancouver",
    state: "British Columbia",
    country: "Canada",
    population: "662,248",
    medianIncome: "C$77,000",
    medianHomePrice: "C$1,250,000",
    description: "Vancouver real estate consistently ranks among the least affordable markets in North America, driven by severe geographic land constraints between mountains and ocean plus heavy international investment demand. Vancouver homes for sale span West Side heritage homes to dense downtown towers with harbor views.",
    neighborhoods: ["Kitsilano", "Yaletown", "West End", "Point Grey", "Mount Pleasant", "Coal Harbour"],
    schools: [
      { name: "University of British Columbia", rating: "10/10", type: "University" },
      { name: "Point Grey Secondary School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Vancouver real estate so unaffordable relative to local incomes?", a: "Vancouver's geography — hemmed in by ocean, mountains, and the US border — severely limits developable land, while strong global investment demand has pushed prices well beyond what local wages alone would support." },
      { q: "What is the median home price in Vancouver?", a: "The median home price in Vancouver is approximately C$1,250,000, with West Side neighborhoods like Point Grey commanding significantly more." },
    ],
  },
  montreal: {
    name: "Montreal",
    state: "Quebec",
    country: "Canada",
    population: "1,762,949",
    medianIncome: "C$65,000",
    medianHomePrice: "C$550,000",
    description: "Montreal real estate offers relative affordability compared to Toronto and Vancouver, combined with a distinctive bilingual culture, historic architecture, and a growing AI and gaming tech sector. Montreal homes for sale include classic Plateau triplexes with exterior staircases and modern condos in Griffintown.",
    neighborhoods: ["Plateau-Mont-Royal", "Griffintown", "Mile End", "Westmount", "Old Montreal", "Verdun"],
    schools: [
      { name: "McGill University", rating: "10/10", type: "University" },
      { name: "Université de Montréal", rating: "9/10", type: "University" },
    ],
    faqs: [
      { q: "Is Montreal more affordable than Toronto real estate?", a: "Significantly — Montreal home prices typically run at roughly half of Toronto's for comparable properties, making it one of the better-value major markets in Canada." },
      { q: "What makes Montreal's Plateau neighborhood distinctive?", a: "The Plateau-Mont-Royal is known for its colorful triplexes with iconic exterior spiral staircases, a housing style unique to Montreal's historic urban fabric." },
    ],
  },
  calgary: {
    name: "Calgary",
    state: "Alberta",
    country: "Canada",
    population: "1,306,784",
    medianIncome: "C$97,000",
    medianHomePrice: "C$580,000",
    description: "Calgary real estate benefits from Alberta's lack of provincial sales tax and a resource-driven economy centered on oil and gas, alongside a growing tech sector. Calgary homes for sale offer some of the best value among major Canadian cities, particularly for detached family homes.",
    neighborhoods: ["Beltline", "Kensington", "Mission", "Inglewood", "Signal Hill", "Bridgeland"],
    schools: [
      { name: "University of Calgary", rating: "8/10", type: "University" },
      { name: "Western Canada High School", rating: "8/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Calgary more affordable than Toronto or Vancouver?", a: "Alberta's lack of provincial sales tax, abundant developable land, and less restrictive zoning have kept Calgary home prices well below Canada's most expensive markets despite strong incomes." },
      { q: "How does the energy sector affect Calgary real estate?", a: "As Canada's oil and gas hub, Calgary's housing market has historically tracked energy prices closely, with strong demand during commodity upswings and softer periods during downturns." },
    ],
  },
  edmonton: {
    name: "Edmonton",
    state: "Alberta",
    country: "Canada",
    population: "1,010,899",
    medianIncome: "C$91,000",
    medianHomePrice: "C$400,000",
    description: "Edmonton real estate offers some of the best affordability among major Canadian metros, as Alberta's capital city and a major hub for government, energy, and healthcare employment. Edmonton homes for sale provide significantly more space per dollar than Calgary or Toronto.",
    neighborhoods: ["Oliver", "Old Strathcona", "Glenora", "Westmount", "Windermere", "Highlands"],
    schools: [
      { name: "University of Alberta", rating: "9/10", type: "University" },
      { name: "Old Scona Academic High School", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Edmonton cheaper than Calgary real estate?", a: "Yes, Edmonton typically prices below Calgary for comparable homes, making it one of the more accessible major markets in Alberta and Canada overall." },
      { q: "What drives Edmonton's real estate demand?", a: "As Alberta's capital, Edmonton benefits from stable government employment alongside energy-sector jobs and the University of Alberta, supporting steady rather than boom-bust housing demand." },
    ],
  },
  ottawa: {
    name: "Ottawa",
    state: "Ontario",
    country: "Canada",
    population: "1,017,449",
    medianIncome: "C$96,000",
    medianHomePrice: "C$650,000",
    description: "Ottawa real estate benefits from Canada's most recession-resistant employment base as the national capital, with a large federal government and tech sector workforce. Ottawa homes for sale range from historic Glebe homes near the canal to new-construction suburbs in Kanata.",
    neighborhoods: ["The Glebe", "Westboro", "Centretown", "New Edinburgh", "Kanata", "Barrhaven"],
    schools: [
      { name: "University of Ottawa", rating: "8/10", type: "University" },
      { name: "Lisgar Collegiate Institute", rating: "9/10", type: "Public" },
    ],
    faqs: [
      { q: "Is Ottawa real estate a stable investment?", a: "As Canada's capital, Ottawa's federal government employment base provides unusual stability compared to resource- or finance-dependent cities, historically producing steadier price growth." },
      { q: "What is the median home price in Ottawa?", a: "The median home price in Ottawa is approximately C$650,000, with The Glebe and Westboro commanding premiums for canal and river proximity." },
    ],
  },
  winnipeg: {
    name: "Winnipeg",
    state: "Manitoba",
    country: "Canada",
    population: "749,607",
    medianIncome: "C$76,000",
    medianHomePrice: "C$350,000",
    description: "Winnipeg real estate is one of the most affordable major markets in Canada, anchored by a diversified manufacturing, agribusiness, and transportation economy at the heart of the prairies. Winnipeg homes for sale offer strong value for buyers prioritizing affordability over climate.",
    neighborhoods: ["River Heights", "Wolseley", "Osborne Village", "St. Boniface", "Tuxedo", "Corydon"],
    schools: [
      { name: "University of Manitoba", rating: "7/10", type: "University" },
      { name: "Kelvin High School", rating: "7/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Winnipeg so affordable compared to other Canadian cities?", a: "Winnipeg's prairie location, ample developable land, and less speculative investment demand than Toronto or Vancouver keep home prices among the lowest of Canada's major metros." },
      { q: "What is the median home price in Winnipeg?", a: "The median home price in Winnipeg is approximately C$350,000, among the most accessible of any major Canadian city." },
    ],
  },
  "quebec-city": {
    name: "Quebec City",
    state: "Quebec",
    country: "Canada",
    population: "549,459",
    medianIncome: "C$62,000",
    medianHomePrice: "C$375,000",
    description: "Quebec City real estate offers historic, francophone charm within Canada's only walled city north of Mexico, combined with a stable government and insurance-sector economy. Quebec City homes for sale include centuries-old stone homes in Old Quebec and modern condos in Sainte-Foy.",
    neighborhoods: ["Old Quebec", "Montcalm", "Sainte-Foy", "Limoilou", "Saint-Roch", "Sillery"],
    schools: [
      { name: "Université Laval", rating: "9/10", type: "University" },
      { name: "Collège François-de-Laval", rating: "8/10", type: "Private" },
    ],
    faqs: [
      { q: "Is Quebec City affordable compared to Montreal?", a: "Yes, Quebec City generally offers comparable or lower prices than Montreal, with the added appeal of the UNESCO World Heritage Old Quebec district." },
      { q: "Do I need to speak French to buy real estate in Quebec City?", a: "French is the dominant language for most transactions and legal documents in Quebec City, so working with a bilingual agent and notary is strongly recommended for non-French-speaking buyers." },
    ],
  },
  hamilton: {
    name: "Hamilton",
    state: "Ontario",
    country: "Canada",
    population: "579,200",
    medianIncome: "C$78,000",
    medianHomePrice: "C$700,000",
    description: "Hamilton real estate has become a popular alternative for buyers priced out of Toronto, offering a roughly hour-long GO Train commute alongside its own growing arts, healthcare, and steel-manufacturing economy. Hamilton homes for sale include historic Durand mansions and escarpment-view properties.",
    neighborhoods: ["Durand", "Locke Street", "Westdale", "Ancaster", "Stoney Creek", "Corktown"],
    schools: [
      { name: "McMaster University", rating: "9/10", type: "University" },
      { name: "Westdale Secondary School", rating: "7/10", type: "Public" },
    ],
    faqs: [
      { q: "Why are Toronto buyers moving to Hamilton real estate?", a: "Hamilton offers a direct GO Train connection to Toronto with significantly lower home prices, making it a popular commuter alternative as Toronto affordability has worsened." },
      { q: "What is the median home price in Hamilton?", a: "The median home price in Hamilton is approximately C$700,000, still notably below comparable Toronto neighborhoods." },
    ],
  },
  kitchener: {
    name: "Kitchener",
    state: "Ontario",
    country: "Canada",
    population: "256,885",
    medianIncome: "C$84,000",
    medianHomePrice: "C$650,000",
    description: "Kitchener real estate sits at the heart of Ontario's \"Silicon Valley North\" tech corridor alongside Waterloo, home to BlackBerry's legacy and a fast-growing startup ecosystem tied to the University of Waterloo. Kitchener homes for sale offer meaningfully more affordability than the Greater Toronto Area while sharing its tech-driven job growth.",
    neighborhoods: ["Victoria Park", "Uptown Waterloo border", "Doon", "Forest Heights", "Stanley Park", "Rosemount"],
    schools: [
      { name: "University of Waterloo", rating: "9/10", type: "University" },
      { name: "Grand River Collegiate Institute", rating: "7/10", type: "Public" },
    ],
    faqs: [
      { q: "Why is Kitchener called part of Silicon Valley North?", a: "The University of Waterloo's strong engineering and computer science programs have spun off a dense cluster of tech startups across Kitchener-Waterloo, drawing comparisons to California's Silicon Valley." },
      { q: "Is Kitchener more affordable than Toronto real estate?", a: "Yes, Kitchener home prices typically run well below the Greater Toronto Area while offering a roughly 90-minute commute via GO Train for buyers who occasionally need to be in Toronto." },
    ],
  },
  "castle-hayne": {
    name: "Castle Hayne",
    state: "North Carolina",
    country: "USA",
    population: "1,495",
    medianIncome: "$62,400",
    medianHomePrice: "$385,000",
    appreciationRate: "+7.1% YoY",
    marketType: "Riverfront & Land Growth Market",
    description:
      "Explore Castle Hayne riverfront home plans and real estate along the Northeast Cape Fear River. Castle Hayne, North Carolina combines rural acreage, custom home plans, and new-construction opportunities minutes from Wilmington — one of the strongest riverfront markets in the Southeast for buyers seeking water views, boat access, and buildable land.",
    neighborhoods: ["Northeast Cape Fear Riverfront", "Mill Creek", "Piney Woods", "Scotts Hill", "Wilmington North Corridor"],
    schools: [
      { name: "Castle Hayne Elementary School", rating: "8/10", type: "Public" },
      { name: "Roland-Grise Middle School", rating: "8/10", type: "Public" },
      { name: "E. A. Laney High School", rating: "7/10", type: "Public" },
    ],
    faqs: [
      { q: "What are riverfront home plans in Castle Hayne?", a: "Riverfront home plans in Castle Hayne range from elevated coastal-style designs to one-level ranch plans built on piers, sized for Northeast Cape Fear River lots with flood-compliant foundations, private docks, and screened porches facing the water." },
      { q: "How much do riverfront properties cost in Castle Hayne?", a: "The median home price in Castle Hayne is approximately $385,000, while riverfront parcels and custom builds with deeded water access typically range from $450,000 to $900,000 depending on acreage and dock rights." },
      { q: "Can I build a custom home on riverfront land in Castle Hayne?", a: "Yes. Much of Castle Hayne's riverfront inventory is buildable land, and buyers routinely pair purchased lots with custom home plans. Verify FEMA flood elevation requirements, setbacks, and HOA covenants before finalizing a plan." },
    ],
    propertyTypes: [
      { type: "Riverfront Single-Family", avgPrice: "$675,000", description: "Custom homes and established residences with private docks, deep-water access, and elevated, flood-compliant designs." },
      { type: "Buildable Riverfront Land", avgPrice: "$195,000", description: "Acreage lots along the Northeast Cape Fear River ready for custom home plans, many with deeded water access and clearing." },
      { type: "New Construction", avgPrice: "$430,000", description: "Builder-offered home plans on dry lots, ideal for buyers who want river-town proximity without the build process." },
    ],
    investmentInsights:
      "Castle Hayne sits on the growth frontier of the Wilmington metro, where waterfront supply is fixed and demand continues to climb. Riverfront lots with dock permits and flood-compliant elevation gain the most value, making custom home plans on buildable land the strongest long-term play.",
  },
};

function fallbackCity(slug: string): CityData {
  const name = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    name,
    state: "",
    country: "USA",
    population: "350,000",
    medianIncome: "$65,000",
    medianHomePrice: "$350,000",
    description: `Explore real estate for sale in ${name}. Browse current homes for sale, analyze neighborhood trends, evaluate local schools, and connect with top real estate agents in ${name}.`,
    neighborhoods: ["Downtown", "Northside", "East End", "West Park", "South Hill"],
    schools: [
      { name: `${name} Central High`, rating: "8/10", type: "Public" },
      { name: `${name} State University`, rating: "8/10", type: "University" },
    ],
    faqs: [
      { q: `What is the average home price in ${name}?`, a: `The median home price in ${name} offers accessible entry points for buyers, with prices varying by neighborhood, school district, and square footage.` },
      { q: `Is ${name} a good market for real estate investors?`, a: `${name} provides a healthy balance of rental demand, price appreciation, and economic stability for long-term residential real estate investments.` },
    ],
  };
}

export const CITY_SLUGS = [
  "new-york-city", "los-angeles", "chicago", "houston", "phoenix", "philadelphia", "san-antonio", "san-diego", "dallas", "san-jose",
  "austin", "jacksonville", "fort-worth", "columbus", "charlotte", "indianapolis", "san-francisco", "seattle", "denver", "washington",
  "nashville", "oklahoma-city", "el-paso", "boston", "portland", "las-vegas", "memphis", "louisville", "baltimore", "milwaukee",
  "albuquerque", "tucson", "fresno", "sacramento", "mesa", "kansas-city", "atlanta", "omaha", "colorado-springs", "raleigh",
  "long-beach", "virginia-beach", "miami", "oakland", "minneapolis", "tulsa", "tampa", "arlington", "new-orleans", "wichita",
  "castle-hayne",
  "toronto", "vancouver", "montreal", "calgary", "edmonton", "ottawa", "winnipeg", "quebec-city", "hamilton", "kitchener",
];

function getCityTaxRate(state: string, country: string): string {
  if (country === "Canada") return "0.65% - 0.95% (Municipal)";
  switch (state) {
    case "Texas": return "1.80% (No State Income Tax)";
    case "California": return "1.15% (Prop 13 Protection)";
    case "Florida": return "0.98% (No State Income Tax)";
    case "New York": return "1.68%";
    case "Illinois": return "2.05%";
    case "Washington": return "0.94% (No State Income Tax)";
    case "Nevada": return "0.55% (No State Income Tax)";
    case "Tennessee": return "0.66% (No State Income Tax)";
    case "North Carolina": return "0.78%";
    case "Georgia": return "0.87%";
    case "Arizona": return "0.62%";
    case "Colorado": return "0.51%";
    case "Massachusetts": return "1.12%";
    case "Oregon": return "0.93% (No Sales Tax)";
    default: return "1.10%";
  }
}

function getCityAppreciation(slug: string): string {
  const map: Record<string, string> = {
    "new-york-city": "+4.8% YoY",
    "los-angeles": "+5.2% YoY",
    "chicago": "+3.9% YoY",
    "houston": "+4.5% YoY",
    "phoenix": "+6.1% YoY",
    "dallas": "+5.7% YoY",
    "austin": "+4.2% YoY",
    "miami": "+7.4% YoY",
    "seattle": "+5.1% YoY",
    "denver": "+4.6% YoY",
    "tampa": "+6.8% YoY",
    "raleigh": "+6.5% YoY",
    "nashville": "+6.2% YoY",
    "toronto": "+3.8% YoY",
    "vancouver": "+4.1% YoY",
  };
  return map[slug] || "+5.2% YoY";
}

function getCityPricePerSqFt(medianPriceStr: string, slug: string): string {
  if (!medianPriceStr) return "$280 / sq ft";
  const numeric = parseInt(medianPriceStr.replace(/[^0-9]/g, ""), 10);
  if (isNaN(numeric) || numeric === 0) return "$280 / sq ft";
  let estSqFtPrice = Math.round(numeric / 1800);
  if (slug === "new-york-city") estSqFtPrice = 1450;
  if (slug === "san-francisco") estSqFtPrice = 1100;
  if (slug === "los-angeles") estSqFtPrice = 780;
  if (slug === "vancouver") estSqFtPrice = 1050;
  if (slug === "toronto") estSqFtPrice = 850;
  const isCad = medianPriceStr.includes("C$") || medianPriceStr.includes("CAD");
  return `${isCad ? "C$" : "$"}${estSqFtPrice.toLocaleString()} / sq ft`;
}

function getCityWalkScore(slug: string): string {
  const scores: Record<string, string> = {
    "new-york-city": "88 / 100 (Walker's Paradise)",
    "san-francisco": "86 / 100 (Walker's Paradise)",
    "boston": "83 / 100 (Very Walkable)",
    "chicago": "77 / 100 (Very Walkable)",
    "philadelphia": "75 / 100 (Very Walkable)",
    "seattle": "74 / 100 (Very Walkable)",
    "washington": "76 / 100 (Very Walkable)",
    "toronto": "81 / 100 (Very Walkable)",
    "vancouver": "80 / 100 (Very Walkable)",
    "montreal": "79 / 100 (Very Walkable)",
    "los-angeles": "68 / 100 (Somewhat Walkable)",
    "miami": "77 / 100 (Very Walkable)",
  };
  return scores[slug] || "64 / 100 (Somewhat Walkable)";
}

function getCityMarketType(slug: string): string {
  const sellerMarkets = ["miami", "tampa", "raleigh", "nashville", "phoenix", "dallas", "charlotte", "colorado-springs", "austin"];
  if (sellerMarkets.includes(slug)) return "High-Demand Growth Corridor";
  return "Balanced Growth Market";
}

function getCityTopEmployers(state: string, country: string): string[] {
  if (country === "Canada") {
    return ["Financial Services & Banking", "Technology & AI Innovation", "Healthcare Systems", "Government & Higher Education"];
  }
  if (state === "Texas") {
    return ["Energy & Technology", "Corporate Headquarters", "Healthcare Networks", "Aerospace & Defense"];
  }
  if (state === "California") {
    return ["Technology & Software", "Biotech & Life Sciences", "Media & Entertainment", "Higher Education"];
  }
  if (state === "Florida") {
    return ["Finance & Wealth Management", "Healthcare Research", "International Logistics", "Tourism & Commercial Real Estate"];
  }
  return ["Healthcare & Life Sciences", "Financial Services", "Technology & Innovation", "Logistics & Higher Education"];
}

function getCityPropertyTypes(cityName: string, medianPrice: string) {
  const isCad = medianPrice.includes("C$") || medianPrice.includes("CAD");
  const currency = isCad ? "C$" : "$";
  const baseNum = parseInt(medianPrice.replace(/[^0-9]/g, ""), 10) || 450000;

  return [
    {
      type: `Single-Family Detached Homes`,
      avgPrice: `${currency}${Math.round(baseNum * 1.15).toLocaleString()}`,
      description: `Spacious 3-5 bedroom homes with private yards, garages, and access to top neighborhood schools in ${cityName}.`,
    },
    {
      type: `Luxury Condos & High-Rises`,
      avgPrice: `${currency}${Math.round(baseNum * 0.88).toLocaleString()}`,
      description: `Modern condominiums offering panoramic skyline views, concierge services, fitness centers, and prime urban center access.`,
    },
    {
      type: `Townhomes & Modern Rowhouses`,
      avgPrice: `${currency}${Math.round(baseNum * 0.76).toLocaleString()}`,
      description: `Multi-level residences blending urban convenience, private outdoor patios, and lower maintenance fees.`,
    },
    {
      type: `Multi-Family & Investment Assets`,
      avgPrice: `${currency}${Math.round(baseNum * 1.48).toLocaleString()}`,
      description: `Duplexes and multi-unit residential assets producing high passive rental income and long-term equity growth in ${cityName}.`,
    },
  ];
}

function getCityBuyingGuide(cityName: string, stateName: string) {
  return [
    {
      step: "01",
      title: `Financial Pre-Approval & Tax Planning`,
      text: `Secure loan pre-approval with a licensed local mortgage specialist in ${cityName}. Factor in property tax estimates, HOA dues, and closing costs before placing offers.`,
    },
    {
      step: "02",
      title: `Neighborhood Selection & School Mapping`,
      text: `Determine target submarkets in ${cityName} based on proximity to major job hubs, school ratings, transit convenience, and price appreciation history.`,
    },
    {
      step: "03",
      title: `Property Tours & Strategic Bidding`,
      text: `Tour verified ${cityName} property listings with an expert local realtor. Formulate competitive purchase contracts backed by comparable sales data.`,
    },
    {
      step: "04",
      title: `Inspection, Appraisal & Escrow Closing`,
      text: `Perform thorough home inspections, confirm title insurance, and complete final escrow closing with trusted real estate closing officers in ${stateName || "your state"}.`,
    },
  ];
}

function getRelatedCities(currentSlug: string, currentState: string, currentCountry: string) {
  const matches = CITY_SLUGS.filter((s) => {
    if (s === currentSlug) return false;
    const data = CITY_DB[s];
    if (!data) return false;
    return data.state === currentState || data.country === currentCountry;
  });
  return matches.slice(0, 4).map((s) => ({ slug: s, data: CITY_DB[s] }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params;

  if (!CITY_SLUGS.includes(slug)) notFound();

  const city = CITY_DB[slug] ?? fallbackCity(slug);
  const loc = city.state ? `${city.name}, ${city.state}` : city.name;

  const keywords = [
    `${city.name.toLowerCase()} real estate`,
    `real estate in ${city.name.toLowerCase()}`,
    `${city.name.toLowerCase()} real estate listings`,
    `houses ${city.name.toLowerCase()}`,
    `houses in ${city.name.toLowerCase()}`,
    `${city.name.toLowerCase()} homes`,
    `${city.name.toLowerCase()} homes for sale`,
    `property in ${city.name.toLowerCase()}`,
    `${city.name.toLowerCase()} properties`,
    `domestic real estate`,
    `buy house in ${city.name}`,
    `best neighborhoods in ${city.name}`,
  ];

  if (slug === "new-york-city") {
    keywords.push(
      "nyc real estate",
      "property in nyc",
      "houses in nyc",
      "new york city real estate listings"
    );
  }

  return buildMetadata({
    title: `${city.name} Real Estate & Homes for Sale | Market Insights`,
    fullTitle: `${city.name} Real Estate & Homes for Sale | Domestic Real Estate`,
    description: `Browse verified ${loc} real estate & homes for sale. View market trends, median prices, top neighborhood school ratings, property tax rates, and connect with top local realtors in ${city.name}.`,
    path: `/cities/${slug}`,
    keywords,
  });
}

export default async function CityDetailPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;

  if (!CITY_SLUGS.includes(slug)) notFound();

  const city = CITY_DB[slug] ?? fallbackCity(slug);

  const pricePerSqFt = city.avgPricePerSqFt || getCityPricePerSqFt(city.medianHomePrice, slug);
  const taxRate = city.propertyTaxRate || getCityTaxRate(city.state, city.country);
  const appreciation = city.appreciationRate || getCityAppreciation(slug);
  const walkScore = city.walkScore || getCityWalkScore(slug);
  const marketType = city.marketType || getCityMarketType(slug);
  const topEmployers = city.topEmployers || getCityTopEmployers(city.state, city.country);
  const propertyTypes = city.propertyTypes || getCityPropertyTypes(city.name, city.medianHomePrice);
  const buyingGuide = city.buyingGuide || getCityBuyingGuide(city.name, city.state);
  const relatedCities = getRelatedCities(slug, city.state, city.country);

  const stats = [
    city.medianHomePrice ? { label: "Median Home Price", value: city.medianHomePrice } : null,
    { label: "Est. Price / Sq Ft", value: pricePerSqFt },
    { label: "YoY Price Growth", value: appreciation },
    city.population ? { label: "Population", value: city.population } : null,
    city.medianIncome ? { label: "Median Household Income", value: city.medianIncome } : null,
    { label: "Property Tax Est.", value: taxRate },
    { label: "Walkability Index", value: walkScore },
  ].filter((s): s is { label: string; value: string } => !!s);

  const cityLd = {
    "@context": "https://schema.org",
    "@type": "City",
    name: city.name,
    url: `${SITE_URL}/cities/${slug}`,
    description: city.description,
    ...(city.state ? { containedInPlace: { "@type": "AdministrativeArea", name: city.state } } : {}),
  };

  const placeLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${city.name} Real Estate Market`,
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressRegion: city.state,
      addressCountry: city.country,
    },
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          cityLd,
          placeLd,
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Cities", path: "/cities" },
            { name: city.name, path: `/cities/${slug}` },
          ]),
          faqLd(city.faqs.map((f) => ({ question: f.q, answer: f.a }))),
        ]}
      />

      {/* Hero Header */}
      <section className="bg-[#0A2647] text-white py-14 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs md:text-sm font-body text-white/60">
              <li><Link href="/" className="hover:text-[#C9A227] transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/cities" className="hover:text-[#C9A227] transition-colors">Cities</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white font-semibold" aria-current="page">{city.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                <span>{marketType}</span>
              </div>
              <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                {city.name} Real Estate & Homes for Sale
              </h1>
              {city.state && <p className="font-body text-white/80 text-lg mb-4">{city.state}, {city.country}</p>}
              <p className="font-body text-white/70 leading-relaxed text-base md:text-lg max-w-2xl">{city.description}</p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/properties"
                  className="bg-[#C9A227] hover:bg-[#b08d1e] text-[#0A2647] font-heading font-bold px-6 py-3 rounded-xl transition-all shadow-lg text-sm"
                >
                  Browse {city.name} Homes
                </Link>
                <Link
                  href="/agents"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-heading font-semibold px-6 py-3 rounded-xl transition-all text-sm backdrop-blur-sm"
                >
                  Contact Local Agent
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 shadow-2xl">
                <h3 className="font-heading text-lg font-bold text-white mb-4 flex items-center justify-between">
                  <span>Market Snapshot</span>
                  <span className="text-xs font-normal text-[#C9A227] bg-[#C9A227]/10 px-2.5 py-0.5 rounded-full border border-[#C9A227]/30">2026 Data</span>
                </h3>
                <dl className="grid grid-cols-2 gap-3">
                  {stats.slice(0, 6).map((stat) => (
                    <div key={stat.label} className="bg-white/5 rounded-xl p-3.5 border border-white/10">
                      <dt className="font-body text-white/60 text-xs">{stat.label}</dt>
                      <dd className="font-heading text-base md:text-lg font-bold text-white mt-1">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Grid Section */}
      <section className="py-16 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A2647]">
                Featured Homes for Sale in {city.name}
              </h2>
              <p className="font-body text-slate-500 text-sm mt-1">Explore active MLS listings and verified properties</p>
            </div>
            <Link href="/properties" className="text-sm font-heading font-bold text-[#C9A227] hover:text-[#0A2647] transition-colors">
              View all listings →
            </Link>
          </div>
          <PropertyGrid
            query={{ city: city.name }}
            limit={6}
            emptyMessage={`We don't have active listings in ${city.name} right now. Browse all properties or contact a local agent for off-market opportunities.`}
          />
        </div>
      </section>

      {/* Deep Market Analysis & Investment Insights */}
      <section className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[#C9A227] font-heading text-xs font-bold uppercase tracking-widest">Real Estate Analysis</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647]">
                {city.name} Housing Market Trends & Growth Factors
              </h2>
              <div className="font-body text-slate-700 leading-relaxed space-y-4">
                <p>
                  The real estate market in <strong>{city.name}</strong> represents one of the region&apos;s most active property landscapes. With a median home price of <strong>{city.medianHomePrice}</strong> and steady year-over-year appreciation averaging <strong>{appreciation}</strong>, buyers and investors find compelling opportunities across both single-family neighborhoods and urban high-rises.
                </p>
                <p>
                  Economic growth in {city.name} is underpinned by key employment sectors including {topEmployers.slice(0, 3).join(", ")}, driving a steady influx of skilled workforce relocations and strong household income growth (median <strong>{city.medianIncome}</strong>).
                </p>
                <p>
                  Property buyers in {city.name} benefit from an average price per square foot of <strong>{pricePerSqFt}</strong>, alongside an estimated property tax rate of <strong>{taxRate}</strong>. Whether purchasing a primary residence or expanding an investment portfolio, {city.name}&apos;s structural demand drivers support long-term capital preservation.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-heading text-xl font-bold text-[#0A2647] mb-4">Key Market Drivers in {city.name}</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0A2647]/5 text-[#0A2647] flex items-center justify-center shrink-0 font-bold text-sm">01</div>
                    <div>
                      <h4 className="font-heading font-bold text-[#0A2647] text-sm">Employment Infrastructure</h4>
                      <p className="font-body text-xs text-slate-600 mt-0.5">Anchored by top industries: {topEmployers.join(", ")}.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0A2647]/5 text-[#0A2647] flex items-center justify-center shrink-0 font-bold text-sm">02</div>
                    <div>
                      <h4 className="font-heading font-bold text-[#0A2647] text-sm">Tax & Financial Climate</h4>
                      <p className="font-body text-xs text-slate-600 mt-0.5">Estimated property tax of {taxRate} with stable equity performance.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0A2647]/5 text-[#0A2647] flex items-center justify-center shrink-0 font-bold text-sm">03</div>
                    <div>
                      <h4 className="font-heading font-bold text-[#0A2647] text-sm">Urban Mobility</h4>
                      <p className="font-body text-xs text-slate-600 mt-0.5">Walkability index rating of {walkScore}.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Types Breakdown */}
      <section className="py-16 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[#C9A227] font-heading text-xs font-bold uppercase tracking-widest">Housing Options</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mt-2">
              Property Types in {city.name}
            </h2>
            <p className="font-body text-slate-600 mt-3 text-sm md:text-base">
              Explore diverse residential options across {city.name}&apos;s real estate market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {propertyTypes.map((pt, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-[#C9A227]/40 transition-all hover:shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#0A2647] text-[#C9A227] font-bold flex items-center justify-center mb-4 text-sm">
                  0{i + 1}
                </div>
                <h3 className="font-heading font-bold text-[#0A2647] text-lg mb-1">{pt.type}</h3>
                <p className="font-heading text-[#C9A227] font-bold text-sm mb-3">Avg: {pt.avgPrice}</p>
                <p className="font-body text-slate-600 text-xs leading-relaxed">{pt.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Neighborhoods */}
      {city.neighborhoods.length > 0 && (
        <section className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
              <div>
                <span className="text-[#C9A227] font-heading text-xs font-bold uppercase tracking-widest">Local Submarkets</span>
                <h2 className="font-heading text-3xl font-bold text-[#0A2647] mt-1">Popular {city.name} Neighborhoods</h2>
              </div>
              <p className="font-body text-slate-500 text-sm max-w-md">Top residential districts searched by home buyers and real estate investors.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {city.neighborhoods.map((n) => (
                <div key={n} className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm hover:border-[#C9A227] transition-all">
                  <span className="font-heading font-bold text-[#0A2647] text-sm block">{n}</span>
                  <span className="font-body text-[11px] text-slate-400 mt-1 block">Explore Homes</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Schools & Education Section */}
      {city.schools.length > 0 && (
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-10">
              <span className="text-[#C9A227] font-heading text-xs font-bold uppercase tracking-widest">Education & Community</span>
              <h2 className="font-heading text-3xl font-bold text-[#0A2647] mt-1">Schools & Higher Education in {city.name}</h2>
              <p className="font-body text-slate-600 text-sm mt-2">Verified public schools and higher education institutions impacting local property values.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {city.schools.map((school, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-bold text-[#0A2647] text-base">{school.name}</h3>
                    <p className="font-body text-slate-500 text-xs mt-1">{school.type} Institution</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {school.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Buying Guide Checklist */}
      <section className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[#C9A227] font-heading text-xs font-bold uppercase tracking-widest">Buyer Workflow</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mt-2">
              How to Buy Real Estate in {city.name}
            </h2>
            <p className="font-body text-slate-600 mt-2 text-sm">Step-by-step guidance for navigating property transactions in {city.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {buyingGuide.map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
                <span className="text-4xl font-heading font-extrabold text-[#C9A227]/30 absolute top-4 right-4">{item.step}</span>
                <h3 className="font-heading font-bold text-[#0A2647] text-base mb-2 pr-8">{item.title}</h3>
                <p className="font-body text-slate-600 text-xs leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#C9A227] font-heading text-xs font-bold uppercase tracking-widest">Helpful Information</span>
            <h2 className="font-heading text-3xl font-bold text-[#0A2647] mt-1">
              {city.name} Real Estate FAQs
            </h2>
            <p className="font-body text-slate-500 text-sm mt-2">Common questions about home buying, market prices, and investing in {city.name}</p>
          </div>

          <div className="space-y-4">
            {city.faqs.map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-heading font-bold text-[#0A2647] text-base mb-2">{faq.q}</h3>
                <p className="font-body text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Related Markets (Internal SEO Linking) */}
      {relatedCities.length > 0 && (
        <section className="py-16 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-2xl font-bold text-[#0A2647]">Explore Related City Markets</h2>
              <Link href="/cities" className="text-sm font-heading font-bold text-[#C9A227] hover:text-[#0A2647]">View all 60+ cities →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCities.map(({ slug: rSlug, data: rData }) => (
                <Link
                  key={rSlug}
                  href={`/cities/${rSlug}`}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-[#C9A227] transition-all hover:shadow-md block group"
                >
                  <h3 className="font-heading font-bold text-[#0A2647] text-base group-hover:text-[#C9A227] transition-colors">{rData.name}</h3>
                  <p className="font-body text-xs text-slate-500 mt-1">{rData.state ? `${rData.state}, ${rData.country}` : rData.country}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="font-heading text-xs font-bold text-[#0A2647]">{rData.medianHomePrice}</span>
                    <span className="font-body text-xs text-[#C9A227] font-semibold">Explore →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Agent Call to Action */}
      <section className="py-16 bg-[#0A2647] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Connect with a Verified {city.name} Realtor
          </h2>
          <p className="font-body text-white/70 max-w-2xl mx-auto text-sm md:text-base mb-8">
            Get personalized market analysis, off-market property alerts, and expert local guidance for buying or selling real estate in {city.name}.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/agents"
              className="bg-[#C9A227] hover:bg-[#b08d1e] text-[#0A2647] font-heading font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg text-sm"
            >
              Find a {city.name} Agent
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-heading font-semibold px-8 py-3.5 rounded-xl transition-all text-sm"
            >
              Request Market Consultation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
