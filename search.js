const axios = require("axios");
const fs = require("fs");

// How often do you want to check for new inventory. Be good citizens and don't spam the API.
const POLLING_INTERVAL_MIN = 60;

// Where do you want the cache file writen to. Writes cache to file after each polling.
const CACHE_OUTPUT_FILE = ".tesla_used_inventory_cache";

// Search query. Set your desired search configuration here.
// There are likely other search filters that could be added here, but these are the ones I cared about.
// To find others, open the Network inspector tab in Chrome and select the options you want, grab the url
// that starts with 'inventory-results', then urldecode the query parameter to get this json.
const getSearchQuery = (outside) => {
  return encodeURIComponent(
    JSON.stringify({
      query: {
        model: "mx", // Options: ms, mx, my, m3
        condition: "used",
        options: {
          TRIM: ["75D", "100DE", "P100D"],
          AUTOPILOT: [
            "AUTOPILOT_FULL_SELF_DRIVING", // If you want FSD capability. This does not guarantee HW3 is installed
          ],
          CABIN_CONFIG: ["SIX"],
        },
        arrangeby: "Price",
        order: "asc",
        market: "US",
        language: "en",
        super_region: "north america",
        lng: -104.7754307, // Not sure which is more important, lat/lng or zip/region, or a combination of the 4
        lat: 39.866593,
        zip: "80022",
        range: 0,
        region: "CO",
      },
      offset: 00,
      count: 50,
      outsideOffset: 0,
      outsideSearch: outside, // This query is used twice, once for vehicles in your area, again for outside your area that can be shipped
    })
  );
};

// Built search urls for nearby and outside (aka the rest of the super region)
const nearbySearchUrl =
  "https://www.tesla.com/inventory/api/v1/inventory-results?query=" +
  getSearchQuery(false);
const outsideSearchUrl =
  "https://www.tesla.com/inventory/api/v1/inventory-results?query=" +
  getSearchQuery(true);

// Local memory storage for the vehicles we've come across
// Note: once vehicles are sold, they are not removed from this or cache. a lastSeen key was added to be able to clear old vehicles at a later date
let vehicles = {};

// Try reading from the cache file
try {
  const fileData = fs.readFileSync(CACHE_OUTPUT_FILE, "utf8");
  if (fileData) {
    vehicles = JSON.parse(fileData);
  }
} catch (e) {
  console.log(
    "Error reading cache file. A new file will be created for you now."
  );
}

function parseVehicles(results) {
  try {
    results.forEach((result) => {
      if (vehicles[result.VIN] == null) {
        console.log(`Found new vehicle: ${result.Year} ${result.TrimName}`);
        console.log(`\t https://www.tesla.com/used/${result.VIN}`);
        console.log(`\t \$${result.InventoryPrice / 1000}k`);
        console.log(`\t ${(result.Odometer / 1000).toFixed(1)}k miles`);
        console.log(`\t Vehicle History: ${result.VehicleHistory}`);
        console.log(`\t Inventory Reason: ${result.AddToInventoryReason}`);
        console.log(
          `\t has HW3 installed? ${
            result.ManufacturingOptionCodeList.indexOf("APH4") != -1
              ? "yes"
              : "no"
          }\n`
        );
        vehicles[result.VIN] = {
          price: result.InventoryPrice,
          priceHistory: [result.InventoryPrice],
          added: Date.now(),
          odo: result.Odometer,
          label: `${result.Year} ${result.Model.toUpperCase()} ${
            result.TrimName
          }`,
        };
      } else if (vehicles[result.VIN].price != result.InventoryPrice) {
        console.log(`Price changed: ${result.Year} ${result.TrimName}`);
        console.log(`\t https://www.tesla.com/used/${result.VIN}`);
        console.log(`\t Was: \$${vehicles[result.VIN].price / 1000}k`);
        console.log(`\t Now: \$${result.InventoryPrice / 1000}k\n`);
        vehicles[result.VIN].price = result.InventoryPrice;
        vehicles[result.VIN].priceHistory.push(result.InventoryPrice);
      }
      vehicles[result.VIN].lastSeen = Date.now();
    });
  } catch (e) {
    // If no nearby matches, results will be an object instead of array and will throw an error trying to forEach it.
    // I don't currently care about this situation so I just catch and swallow the error, but this could be extended
    // to also show non-exact matches to the search if desired.
  }
}

function getResults(url) {
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then(function (response) {
        const body = response.data;
        const count = body.total_matches_found;
        parseVehicles(body.results);
        resolve(count);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}

async function search() {
  let nearbyResults = 0;
  let outsideResults = 0;
  await Promise.all([
    getResults(nearbySearchUrl).then((results) => (nearbyResults = results)),
    getResults(outsideSearchUrl).then((results) => (outsideResults = results)),
  ]);

  console.log(
    `${new Date().toISOString()}\tNearby matches: ${nearbyResults}\tDistant matches: ${outsideResults}`
  );

  // Store vehicles to cache file so we can keep accurate history in case the script restarts
  fs.writeFile(CACHE_OUTPUT_FILE, JSON.stringify(vehicles), (err) => {
    if (err) {
      console.error("Error writing cache to file: " + err);
      return;
    }
  });
}

// Start polling, then run search now
setInterval(() => {
  search();
}, 1000 * 60 * POLLING_INTERVAL_MIN);
search();
