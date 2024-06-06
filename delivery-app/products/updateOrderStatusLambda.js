const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const { ORDERS_STATUS_TABLE } = process.env;

module.exports.updateOrderStatus = async (event) => {
    try {
        const { orderId, userId } = event;

        const params = {
            TableName: ORDERS_STATUS_TABLE,
            Key: { orderId },
            UpdateExpression: 'set orderStatus = :status, statusUpdateDate = :updateDate',
            ExpressionAttributeValues: {
                ':status': 'completed',
                ':updateDate': new Date().toISOString()
            },
            ReturnValues: 'UPDATED_NEW'
        };

        await dynamo.update(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order status updated to completed' })
        };
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};
