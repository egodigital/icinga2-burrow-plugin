/**
 * icinga2-burrow-plugin
 * Copyright (C) 2020  e.GO Digital GmbH, Aachen, Germany
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

function checkExcludedConsumers(consumer) {
    if (argv._[3] && argv._[3].length > 0) {
        const excludedConsumers = argv._[3].split(',');
        for (let h = 0; h < excludedConsumers.length; h++) {
            const excludedConsumer = excludedConsumers[h];
            if (excludedConsumer === consumer) {
                return true;
            }
        }
        return false;
    } else {
        return false;
    }
}

var argv = require('minimist')(process.argv.slice(2));
if (argv._.length < 3) {
    console.error('The script needs three mandatory parameters: 1. Burrow API Base URL e.g. http://1.2.3.4:9991/v3, 2. Warning threshold, 3. Critical threshold (Optional: 4. Excluded consumers)');
    process.exit(2);
} else {
    const burrowBaseUrl = argv._[0];
    const axios = require('axios');
    let totalLag = 0;

    (async () => {
        try {
            const clustersResponse = await axios.get(burrowBaseUrl + '/kafka')
            for (let i = 0; i < clustersResponse.data.clusters.length; i++) {
                const cluster = clustersResponse.data.clusters[i];
                const consumersResponse = await axios.get(burrowBaseUrl + '/kafka/' + cluster + '/consumer');
                for (let j = 0; j < consumersResponse.data.consumers.length; j++) {
                    const consumer = consumersResponse.data.consumers[j];
                    const lagResponse = await axios.get(burrowBaseUrl + '/kafka/' + cluster + '/consumer/' + consumer + '/lag');
                    if (!checkExcludedConsumers(consumer)) {
                        totalLag += lagResponse.data.status.totallag;
                    }
                }
            }

            const warningThreshold = argv._[1];
            const errorThreshold = argv._[2];
            if (totalLag >= errorThreshold) {
                console.log('CRITICAL - The total lag of unread messages is currently ' + totalLag + ' and above ' + errorThreshold + '|totalLag=' + totalLag);
                process.exit(2);
            } else if (totalLag >= warningThreshold) {
                console.log('WARNING - The total lag of unread messages is currently ' + totalLag + ' and above ' + warningThreshold + '|totalLag=' + totalLag);
                process.exit(1);
            } else {
                console.log('OK - The total lag of unread messages is ' + totalLag + '|totalLag=' + totalLag);
                process.exit(0);
            }
        } catch (error) {
            if (error && error.response && error.response.status && error.response.status !== 404) {
                console.log('CRITICAL - An error occurred: ' + error);
                process.exit(2);
            }
        }
    })();
}
