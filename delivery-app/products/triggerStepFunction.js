const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();

module.exports.triggerStepFunction = async (event) => {
    try {
        const body = JSON.parse(event.Records[0].body);

        const params = {
            stateMachineArn: process.env.STEP_FUNCTION_ARN,
            input: JSON.stringify(body)
        };

        await stepfunctions.startExecution(params).promise();
        console.log("step :")
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Step function triggered successfully' })
        };
    } catch (error) {
        console.error('Error triggering step function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};
