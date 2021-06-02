// Just a basic function
exports.handler = (event) => {
    // eslint-disable-next-line no-console
    console.log(`EVENT: \n${  JSON.stringify(event, null, 2)}`);
};
