import { MongoClient } from 'mongodb';
import { execSync } from 'child_process';

const clusterId = 'gfsa9tp';
const patterns = [
    `dsm-online.${clusterId}.mongodb.net`,
    `cluster0.${clusterId}.mongodb.net`,
    `dev.${clusterId}.mongodb.net`,
    `prod.${clusterId}.mongodb.net`,
];

async function check() {
    for (const host of patterns) {
        console.log(`Checking DNS for: ${host}...`);
        try {
            const out = execSync(`nslookup ${host}`).toString();
            if (out.includes('Address:')) {
                console.log(`✅ Found resolution for ${host}!`);
            } else {
                console.log(`❌ No resolution for ${host}.`);
            }
        } catch (e) {
            console.log(`❌ Error resolving ${host}.`);
        }
        
        console.log(`Checking SRV for: _mongodb._tcp.${host}...`);
        try {
            const out = execSync(`nslookup -type=SRV _mongodb._tcp.${host}`).toString();
            if (out.includes('srv tab')) {
                 console.log(`✅ Found SRV for ${host}!`);
            } else {
                 console.log(`❌ No SRV for ${host}.`);
            }
        } catch (e) {
             console.log(`❌ Error resolving SRV for ${host}.`);
        }
    }
}

check();
