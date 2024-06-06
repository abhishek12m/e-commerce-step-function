// orderProduct.js (E-commerce App)
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
const { v4: uuidv4 } = require('uuid');

const {
    ORDERS_TABLE,
    ORDERS_STATUS_TABLE,
    UPDATE_ORDER_QUEUE_URL
} = process.env;

module.exports.orderProduct = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        const { productId, quantity } = JSON.parse(event.body);
        const userId = event.requestContext.authorizer.principalId;
        const orderId = uuidv4();
        const orderDate = new Date().toISOString();

        const orderParams = {
            TableName: ORDERS_TABLE,
            Item: {
                orderId,
                userId,
                productId,
                quantity,
                orderDate
            }
        };

        await dynamo.put(orderParams).promise();
        console.log('Order placed:', orderParams);

        const statusParams = {
            TableName: ORDERS_STATUS_TABLE,
            Item: {
                orderId,
                userId,
                orderStatus: "order out for delivery",
                createdAt: orderDate,
                statusUpdateDate: orderDate,
                expectedDeliveryTime: new Date(new Date().getTime() + 2 * 60 * 1000).toISOString()
            }
        };
        await dynamo.put(statusParams).promise();
        console.log('Order status:', statusParams);

        // Send order details to SQS
        const sqsMessage = {
            orderId,
            userId,
            expectedDeliveryTime: new Date(Date.now() + 2 * 60 * 1000).toISOString()
        };

        const params = {
            MessageBody: JSON.stringify(sqsMessage),
            QueueUrl: UPDATE_ORDER_QUEUE_URL
        };

        await sqs.sendMessage(params).promise();
        console.log('SQS message sent:', params);

        callback(null, {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order placed successfully' })
        });

    } catch (error) {
        console.error('Error:', error);
        callback(null, {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        });
    }
};
