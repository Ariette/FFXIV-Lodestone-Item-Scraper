# FFXIV Lodestone Item Scraper

FFXIV Lodestone scraper to get source data(instances, drops, etc.) of items.  
It uses [Apify SDK](https://sdk.apify.com/) to crawl data.  

<br>

## Scrapped Data Structure
+ Item  
```javascript
{
  "type": "item",
  "id": string, // Item lodestone ID (ex. "f8bb1541b98")
  "name": string, // Item name (ex. "Darklight Sollerets")
  "instance": string[], // Array of related instances, if there are (ex. ["Halatali (Hard)"])
  "drop": { // Array of related mobs, if there are
    "name": string, // Mob name (ex. "Cockatrice")
    "id": string, // Mob lodestone ID (ex. "c9cd0767a8a")
    "zone": string, // Mob zone name (ex. "The Dravanian Hinterlands")
    "x": string, // Mob coords - X (ex. "18.3")
    "y": string // Mob coords - Y (ex. "32.9")
  }[],
  "acquire": string[] // Coffer name you can get the item, if threr are (ex. "High Mythril Weapon Coffer")
}
```  

+ Mob  
```javascript
{
  "type": "mob",
  "id": string, // Mob lodestone ID (ex. "c9cd0767a8a")
  "lv": string // Mob level (ex. "59")
},
```  

The data is for [Ariette/Project-Anyder](https://github.com/Ariette/Project-Anyder) supplemental data.  
But you can freely use it for any purpose.  

<br>

## How To Run
### Run locally (NodeJS 16+)  
  1. `npm install`
  2. `npx apify run`

### Run in Apify Platform
  1. `npm install`
  2. `npx apify login` to login [Apify](https://apify.com/) - You should enter your API Key to login.
  3. `npx apify push`
  4. Visit [Apify Console](https://console.apify.com/)
  5. Start task

<br>

## Post-Process
You can't use scrapped data for [Ariette/Project-Anyder](https://github.com/Ariette/Project-Anyder) in raw state.  
`node ./postprocess.js [scrapped_data.json]` will convert the data to `lodestones.tsv`, `mob.json`, `ids.json`

<br>

## Scrapped Data
You can download scrapped data from [Release](https://github.com/Ariette/FFXIV-Lodestone-Item-Scraper/releases)