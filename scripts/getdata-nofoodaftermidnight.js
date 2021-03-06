const fs = require('fs');
const path = require('path');

const got = require('got');

const symbols = require('../src/symbols.json');

const START_ROW = 36;
const END_ROW = 160;

const prefixes = [
    '9x18pm_',
    '762x25tt_',
    '9x19_',
    '9x21_',
    '57x28_',
    '46x30_',
    '9x39_',
    '366_',
    '545x39_',
    '556x45_',
    '762x39_',
    '762x51_',
    '762_54R_',
    '127x55_',
];

const URL = 'https://sheet.best/api/sheets/d3cf595e-0d31-4fd8-891b-c0102afed308';

let tempType = false;
let typeCache = [];

const formatRow = function formatRow(row){
    const formattedRow = {
        type: row['I stream:                 '] || tempType,
        name: row['1'],
        damage: Number(row['3']),
        penetration: Number(row['4']),
        armorDamage: Number(row['5']),
        fragChance: row['https://www.twitch.tv/nofoodaftermidnight'],
    };
    
    if(formattedRow.type === 'Mounted Weapons') {
        return false;
    }
    
    if(formattedRow.damage === 0) {
        return false;
    }
    
    let symbol = symbols[typeCache.length];
    
    if(typeCache.includes(formattedRow.type)) {
        symbol = symbols[typeCache.indexOf(formattedRow.type)];
    } else {
        typeCache.push(formattedRow.type);
    }
    
    if(!symbol) {
        console.log(`Missing symbol for ${formattedRow.type}`);
    }
    
    formattedRow.symbol = symbol;
    
    for(const prefix of prefixes){
        formattedRow.name = formattedRow.name.replace(prefix, '');
    }
    
    formattedRow.name = formattedRow.name.replace(/_/g, ' ');
    
    tempType = formattedRow.type;
    
    return formattedRow;
};

(async () => {
    
    console.time('Get excel sheet data');
    const response = await got(URL, {
        responseType: 'json',
    });
    console.timeEnd('Get excel sheet data');
    
    const dataset = response.body.slice(START_ROW, END_ROW).map(formatRow).filter(Boolean);
    
    console.time('Write new data');
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data.json'), JSON.stringify(dataset, null, 4));
    console.timeEnd('Write new data');
})()
