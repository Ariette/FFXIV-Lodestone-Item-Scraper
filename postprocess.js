"use strict";

// Load Libraries
const fs = require("fs");
const lines = [];

(async function() {
    if (process.argv.length < 3) {
        console.log('Warning!! dataset needed.');
        console.log('Simply Drag-and-Drop dataset json file.');
        return;
    }
    // Load file
    const json = fs.readFileSync(process.argv[2], 'utf-8');
    const data = JSON.parse(json.replace(/^\uFEFF/, ''));
    const mobList = {};
    const mob = {};
    const ids = {};
    const lines = [];
    data.forEach(obj => {
        if (obj.type == 'item') ids[obj.name] = obj.id;
        if (obj.type == 'mob') {
            if (!mob[obj.id]) mob[obj.id] = {};
            mob[obj.id].lv = obj.lv;
        };
        if (obj.acquire || obj.instance || obj.drop) {
            const info = {
                Acquire: obj.acquire,
                Instance: obj.instance,
                Drop: obj.drop?.map(w => w.name)
            };
            obj.drop?.forEach(drop => {
                if (!mob[drop.id]) mob[drop.id] = {};
                Object.assign(mob[drop.id], drop);
            });
            Object.keys(info).forEach(key => {
                if (!info[key]) return;
                const str = obj.name + '	' + key + '	' + info[key].join('	');
                lines.push(str);
            });
        }
    });
    for (const id in mob) {
        if (!mobList[mob[id].name.toLowerCase()]) mobList[mob[id].name.toLowerCase()] = [];
        mobList[mob[id].name.toLowerCase()].push(mob[id]);
    }
    const lodestone = 'Item	Category	Sources\n' + lines.join('\n');
    fs.writeFile('./lodestones.tsv', lodestone, (err) => {
        if (err) throw err;
        console.log('lodestone converted.');
    });
    fs.writeFile('./mob.json', JSON.stringify(mobList), (err) => {
        if (err) throw err;
        console.log('mob converted.');
    });
    fs.writeFile('./ids.json', JSON.stringify(ids), (err) => {
        if (err) throw err;
        console.log('id converted.');
    });
})();