# Tesla Used Inventory Monitor
Hits an internal Tesla api to search for existing used inventory and prints to console every time there are new vehicles or price changes for your search parameters

And if you decide to buy new instead, use my referral code to get 1,000 miles of free Supercharging: https://ts.la/stephen77370

## Setup & Run instructions
```
git clone git@github.com:stephenlindauer/tesla-used-inventory-monitor.git
cd tesla-used-inventory-monitor
npm install
node search.js
```


## Results
Regularly hits the api per the defined `POLLING_INTERVAL_MIN` (use responsibly, don't spam) and retuns new vehicles and price changes.

**Shows when new vehicles are found:**
```
Found new vehicle: 2017 100D Ludicrous Performance All-Wheel Drive
	 https://www.tesla.com/used/<redacted>
	 $80.6k
	 22.5k miles
	 Vehicle History: CLEAN
	 Inventory Reason: LEASE_MATURITY
	 has HW3 installed? no

Found new vehicle: 2017 100D Ludicrous Performance All-Wheel Drive
	 https://www.tesla.com/used/<redacted>
	 $81.2k
	 50.0k miles
	 Vehicle History: CLEAN
	 Inventory Reason: TRADEIN
	 has HW3 installed? yes
```

**Price updates:**
```
Price change: 2017 100D Ludicrous Performance All-Wheel Drive
	 https://www.tesla.com/used/<redacted>
	 Was: $78.6k
	 Now: $78.8k
```

## Configuration

The script is setup to look for:
- Model X
- used
- 75D, 100D, or P100D
- FSD Capable
- Six seat configuration
- Located in Denver, CO

If this is what you're looking for, change nothing :) Otherwise, you'll want to edit the `getSearchQuery` function in [search.js](/search.js#L10)

**Location**
At a minimum, you'll want to change `lat`, `lng`, `zip`, and `region` here to match where you are. This is not critical as it'll still show national results, but it does separate nearby vs other. 

**Model**
Update `model` to one of the following: `[ms, mx, my, m3]`

**Trim**
If you care about a specific trim, add it here. Most looked self explanatory (ie.. `75D`).

There are other filters which I did not add because I wasn't concerned, but you could if you wanted. If you discover more, feel free to make a PR and I'll happily accept it. It's easy to find if you want a custom search. Open the Network inspector tab in your browser when viewing the search results from Tesla's page. Find the request for `inventory-results`, then [url decode](https://www.urldecoder.org/) the `query` value. 
