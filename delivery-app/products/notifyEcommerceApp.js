const AWS = require('aws-sdk');
const eventbridge = new AWS.EventBridge();

module.exports.notifyEcommerceApp = async (event) => {
    try {
        const { orderId, userId } = event;

        const params = {
            Entries: [
                {
                    Source: 'delivery-app',
                    DetailType: 'OrderStatusUpdate',
                    Detail: JSON.stringify({ orderId, userId, status: 'completed' }),
                    EventBusName: 'default'
                }
            ]
        };

        await eventbridge.putEvents(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'E-commerce app notified successfully' })
        };
    } catch (error) {
        console.error('Error notifying e-commerce app:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};
