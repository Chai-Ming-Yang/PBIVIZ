class ConciseReporter {
    onTestResult(test, testResult) {
        testResult.testResults.forEach(result => {
            if (result.status === 'passed') {
                console.log(`\x1b[32m√\x1b[0m ${result.title}`);
            } else if (result.status === 'failed') {
                console.log(`\x1b[31m×\x1b[0m ${result.title}`);
            }
            
            // Wipe out the individual verbose error logs
            result.failureMessages = [];
        });
        
        // Wipe out the aggregated file-level error log
        testResult.failureMessage = '';
    }
}
module.exports = ConciseReporter;