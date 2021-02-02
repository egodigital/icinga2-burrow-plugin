var argv = require('minimist')(process.argv.slice(2));
if (argv._.length < 3) {
    console.error('The script needs three mandatory parameters: 1. Burrow API Base URL e.g. http://1.2.3.4:9991/v3, 2. Warning threshold, 3. Critical threshold');
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
                    totalLag += lagResponse.data.status.totallag;
                }
            }

            const warningThreshold = argv._[1];
            const errorThreshold = argv._[2];
            if (totalLag >= errorThreshold) {
                console.log('CRITICAL - The total lag of unread messages is above ' + errorThreshold);
                process.exit(2);
            } else if (totalLag >= warningThreshold) {
                console.log('WARNING - The total lag of unread messages is above ' + warningThreshold);
                process.exit(1);
            } else {
                console.log('OK - The total lag of unread messages is ' + totalLag);
                process.exit(0);
            }
        } catch (error) {
            console.log(error);
        }
    })();
}


