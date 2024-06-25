const CACHE_NAME = "api-cache";

/**
 * Array containing objects representing historical data for TJPR, these values aren't available in the API.
 *
 * @type {Array<{data: string, valor: number}>}
 */
const tjprBefore = [
    {
        data: "01/06/1995",
        valor: 1.82,
    },
    {
        data: "01/05/1995",
        valor: 2.57,
    },
    {
        data: "01/04/1995",
        valor: 1.92,
    },
    {
        data: "01/03/1995",
        valor: 1.41,
    },
    {
        data: "01/02/1995",
        valor: 0.99,
    },
    {
        data: "01/01/1995",
        valor: 1.67,
    },
    {
        data: "01/12/1994",
        valor: 2.19,
    },
    {
        data: "01/11/1994",
        valor: 3.27,
    },
    {
        data: "01/10/1994",
        valor: 1.86,
    },
    {
        data: "01/09/1994",
        valor: 1.51,
    },
    {
        data: "01/08/1994",
        valor: 5.46,
    },
];

const pause = (duration) => new Promise((res) => setTimeout(res, duration));

/**
 * Fetches data from an API based on the provided index, start date, and end date.
 * @param {string} index - The index of the data to fetch.
 * @param {string} startDate - The start date of the data range.
 * @param {string} endDate - The end date of the data range.
 * @returns {Promise<any>} - A promise that resolves to the fetched data.
 */
const dataApi = async (index, startDate, endDate) => {
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${index}/dados?formato=json&dataInicial=${startDate}&dataFinal=${endDate}`;


    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(url);

    if (cachedResponse && cachedResponse.ok) {
        return await cachedResponse.json();
    }

    await pause(100);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseClone = response.clone();

    await cache.put(url, responseClone);

    const data = await response.json();

    return data;
};

function monthDiff(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffMonths = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
}

export function convertStringToDate(dateString) {
    const dateParts = dateString.split("/");
    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
}

/**
 * Makes an API request to retrieve data based on the provided index, start date, and end date.
 * @param {string} index - The index to retrieve data for.
 * @param {string} startDate - The start date of the data range.
 * @param {string} endDate - The end date of the data range.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the accumulated index and base date.
 */
export const apiRequest = async (index, startDate, endDate) => {
    if (
        index === "" || monthDiff(convertStringToDate(startDate),
            convertStringToDate(endDate)) === 0
    ) {
        return {
            accumulatedIndex: parseFloat(1.00000),
            baseDate: convertStringToDate(endDate),
        };
    }
    if (index === "tjpr") {
        const values = ["190", "188"];
        const dataArrays = [];

        let getTjprBefore = 0;

        const startInpcIgpdi = new Date(1995, 6, 1);
        let userSelection = convertStringToDate(startDate);

        if (userSelection < startInpcIgpdi) {
            const oldStartDate = startDate;
            startDate = "01/07/1995";
            getTjprBefore = monthDiff(
                convertStringToDate(oldStartDate),
                convertStringToDate(startDate)
            );
        }

        for (const value of values) {
            try {
                dataArrays.push(await dataApi(value, startDate, endDate));
            } catch (error) {
                window.alert(
                    `Serviço indisponível no momento, tente novamente mais tarde.`
                );
                location.reload();
            }
        }
        if (dataArrays[0].length !== dataArrays[1].length) {
            if (dataArrays[0].length > dataArrays[1].length) {
                dataArrays[0].pop();
            } else {
                dataArrays[1].pop();
            }
        }

        let averageArray = dataArrays[0].map((item, index) => {
            return {
                data: item.data,
                valor:
                    (parseFloat(item.valor) + parseFloat(dataArrays[1][index].valor)) / 2,
            };
        });

        if (getTjprBefore > 0) {

            const tempArray = [];
            for (let i = 0; i < getTjprBefore; i++) {
                tempArray.unshift({
                    data: tjprBefore[i].data,
                    valor: tjprBefore[i].valor,
                });
            }
            averageArray.unshift.apply(averageArray, tempArray);
        }

        const result = await acummulatedIndex(averageArray, endDate);

        averageArray = [];

        return {
            accumulatedIndex: parseFloat(result.accumulatedIndex),
            baseDate: result.baseDate,
        };
    } else {
        try {
            return await acummulatedIndex(
                await dataApi(index, startDate, endDate),
                endDate
            );
        } catch (error) {
            window.alert(
                `Serviço indisponível no momento, tente novamente mais tarde.`
            );
            location.reload();
        }
    }
};
/**
 * Calculates the accumulated index based on the provided data and end date.
 *
 * @param {Array} data - The data array containing index values.
 * @param {string} endDate - The end date in string format (YYYY-MM-DD).
 * @returns {Object} An object containing the accumulated index and the base date.
 */
const acummulatedIndex = async (data, endDate) => {
    let baseDate;

    /**
     * Modifies the input data array based on the last date in the array and the end date.
     * @param {Array} data - The input data array.
     * @returns {Array} - The modified data array.
     */
    function modifiedArray(data) {

        let jsonApiLastDate = data[data.length - 1].data;

        const differMonths =
            monthDiff(
                convertStringToDate(endDate),
                convertStringToDate(jsonApiLastDate)
            );

        if (differMonths === 0) {
            baseDate = convertStringToDate(jsonApiLastDate);
            data.pop();
        }
        if (differMonths === 1) {
            baseDate = convertStringToDate(endDate);
        }
        if (differMonths > 1) {
            baseDate = convertStringToDate(jsonApiLastDate);
            baseDate.setMonth(baseDate.getMonth() + 1);
        }
        return data;
    }
    /**
     * Calculates the accumulated index based on the provided data.
     * @param {Array} data - The data array containing objects with a 'valor' property.
     * @returns {number} The accumulated index.
     */
    function indexNumber(data) {
        let accumulatedIndex = 1;
        data.reduceRight((_, item, i) => {
            accumulatedIndex *= parseFloat(
                (parseFloat(item.valor) / 100 + 1).toFixed(9)
            );
        }, []);

        return accumulatedIndex;
    }
    const accumulatedIndex = indexNumber(modifiedArray(data));

    return {
        accumulatedIndex: accumulatedIndex,
        baseDate: baseDate,
    };
};
